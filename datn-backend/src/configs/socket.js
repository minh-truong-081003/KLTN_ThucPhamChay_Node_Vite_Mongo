import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

dotenv.config();

export default (io) => {
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
    
    // Join user to their own room (để nhận tin nhắn riêng)
    socket.on('join', (data) => {
      socket.username = data;
      socket.join(data);
      console.log(`${data} joined`);

      // Gửi thông báo cho tất cả người dùng trong phòng
      io.emit('user joined', `${data} joined the chat`);
    });

    // Join user to their room by userId
    socket.on('user:join', async (userId) => {
      socket.userId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined their room`);

      try {
        // Nếu userId là 'admin-room' (string literal), chỉ join vào room đó
        if (userId === 'admin-room') {
          socket.join('admin-room');
          console.log(`Joined admin-room for chat notifications`);
          return;
        }

        // Nếu userId là valid ObjectId, check xem có phải admin/staff không
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const user = await User.findById(userId);
          if (user && (user.role === 'admin' || user.role === 'staff')) {
            socket.join('admin-room');
            console.log(`Admin/Staff ${userId} joined admin-room`);
          }
        }
      } catch (error) {
        console.error('Error joining rooms:', error);
      }
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Conversation status changed - broadcast to all admin
    socket.on('conversation:status-changed', (data) => {
      console.log('🔄 Broadcasting status change:', data);
      // Broadcast to admin-room
      io.to('admin-room').emit('conversation:status-changed', data);
      // Also emit to conversation room for any participants
      io.to(data.conversationId).emit('conversation:status-changed', data);
    });

    // Real-time typing indicator
    socket.on('typing:start', ({ conversationId, userId, username }) => {
      socket.to(conversationId).emit('user-typing', { userId, username });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user-stop-typing', { userId });
    });

    // Legacy chat message support (để tương thích với code cũ)
    socket.on('chat message', async (message) => {
      console.log('Message:', message);

      try {
        // Xử lý theo cấu trúc cũ nếu cần
        const newMessage = await Message.create({
          text: message.text,
          sender: socket.userId,
          conversationId: message.conversationId || 'default',
          status: 'sent',
        });

        io.emit('chat message', { text: message.text, username: socket.username });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('client:sendNotificationToAdmin', async (data) => {
      // console.log(data);
      await createNotification(data);
    });
    socket.on('client:sendNotification', async (data) => {
      // console.log(data);
      await createNotification(data);
    });
    socket.on('client:requestUnreadNotificationByidUser', async (idUser) => {
      await getUnReadNotificationByIdUser(idUser);
    });
    socket.on('client:requestUnReadNotificationToAdmin', async () => {
      await getUnReadNotificationToAdmin();
    });

    async function createNotification(data) {
      try {
        const { data: createData } = await axios.post(
          `${process.env.HTTP}/api/create-notification`,
          data
        );
        // io.to(data.idUser).emit('server:sendNotification', createData.data);
        if (data.to === 'user') {
          await getUnReadNotificationByIdUser(createData.data.idUser);
        }
        if (data.to === 'admin') {
          await getUnReadNotificationToAdmin();
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function getUnReadNotificationToAdmin() {
      try {
        await axios.get(`${process.env.HTTP}/api/get-unread-notifications-to-admin`).then((res) => {
          const listNotifications = res.data;
          axios.get(`${process.env.HTTP}/api/user-admin-staff-role`).then((res) => {
            const listAdminStaffs = res.data;
            listAdminStaffs.data.forEach((adminStaff) => {
              io.to(adminStaff._id).emit('server:loadUnreadNotificationToAdmin', listNotifications);
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    async function getUnReadNotificationByIdUser(idUser) {
      try {
        await axios
          .get(`${process.env.HTTP}/api/get-notifications-unread-by-id-user/${idUser}`)
          .then((res) => {
            io.to(idUser).emit('server:loadUnreadNotificationByidUser', res['data']);
          });
      } catch (error) {
        console.log(error);
      }
    }

    async function getOrderUser(option) {
      try {
        await axios.get(`${process.env.HTTP}/api/order-user/${option.room}`).then((res) => {
          io.emit('server:loadOrderUser', res['data']);
        });
      } catch (error) {
        console.log(error);
      }
    }

    async function getCancelOrder(options = '') {
      try {
        await axios
          .get(
            `${process.env.HTTP}/api/order-canceled?_limit=${
              options?.limit ? options.limit : 10
            }&_page=${options?.page ? options.page : 1}&startDate=${
              options?.startDate ? options.startDate : ''
            }&endDate=${options?.endDate ? options.endDate : ''}`
          )
          .then((res) => {
            if (options.room) {
              io.in(options.room).emit('server:loadCancelOrder', res['data']);
            } else {
              socket.broadcast.emit('server:loadCancelOrder', res['data']);
              socket.emit('server:loadCancelOrder', res['data']);
            }
            options.room
              ? io.in(options.room).emit('server:loadCancelOrder', res['data'])
              : socket.emit('server:loadCancelOrder', res['data']);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }

    async function getPendingOrder(options = '') {
      try {
        await axios
          .get(
            `${process.env.HTTP}/api/order-pending?_limit=${
              options?.limit ? options.limit : 10
            }&_page=${options?.page ? options.page : 1}&startDate=${
              options?.startDate ? options.startDate : ''
            }&endDate=${options?.endDate ? options.endDate : ''}`
          )
          .then((res) => {
            if (options.room) {
              io.in(options.room).emit('server:loadPendingOrder', res['data']);
            } else {
              socket.broadcast.emit('server:loadPendingOrder', res['data']);
              socket.emit('server:loadPendingOrder', res['data']);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }

    async function getConfirmedOrder(options = '') {
      try {
        await axios
          .get(
            `${process.env.HTTP}/api/order-confirmed?_limit=${
              options?.limit ? options.limit : 10
            }&_page=${options?.page ? options.page : 1}&startDate=${
              options.startDate ? options.startDate : ''
            }&endDate=${options?.endDate ? options.endDate : ''}`
          )
          .then((res) => {
            if (options.room) {
              io.in(options.room).emit('server:loadConfirmedOrder', res['data']);
            } else {
              socket.broadcast.emit('server:loadConfirmedOrder', res['data']);
              socket.emit('server:loadConfirmedOrder', res['data']);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }

    async function getDoneOrder(options = '') {
      try {
        await axios
          .get(
            `${process.env.HTTP}/api/order-done?_limit=${
              options?.limit ? options.limit : 10
            }&_page=${options?.page ? options.page : 1}&startDate=${
              options?.startDate ? options.startDate : ''
            }&endDate=${options?.endDate ? options.endDate : ''}`
          )
          .then((res) => {
            if (options.room) {
              io.in(options.room).emit('server:loadDoneOrder', res['data']);
            } else {
              socket.broadcast.emit('server:loadDoneOrder', res['data']);
              socket.emit('server:loadDoneOrder', res['data']);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }

    socket.on('client:requestOrderUser', async (options) => {
      await getOrderUser(options);
    });

    socket.on('client:requestCancelOrder', async (options) => {
      await getCancelOrder(options);
    });

    socket.on('client:requestPendingOrder', async (options) => {
      await getPendingOrder(options);
    });

    socket.on('client:requestDeliveredOrder', async (options) => {
      await getDeliveredOrder(options);
    });

    socket.on('client:requestConfirmedOrder', async (options) => {
      await getConfirmedOrder(options);
    });

    socket.on('client:requestDoneOrder', async (options) => {
      await getDoneOrder(options);
    });

    socket.on('client:cancelOrder', async (id) => {
      try {
        await axios
          .put(`${process.env.HTTP}/api/order/canceled/${id}`)
          .then(async (res) => {
            if (res['data'].order.user?._id) {
              await getOrderUser({ room: res['data'].order.user._id });
            }
            await getCancelOrder();
            await getPendingOrder();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('client:createOrder', async (data) => {
      try {
        if (data) {
          await getOrderUser({ room: data });
        }
        await getPendingOrder();
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('client:pendingOrder', async (id) => {
      try {
        await axios
          .put(`${process.env.HTTP}/api/order/pending/${id}`)
          .then(async (res) => {
            if (res['data'].order.user?._id) {
              await getOrderUser({ room: res['data'].order.user._id });
            }
            await getPendingOrder();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('client:doneOrder', async (id) => {
      try {
        await axios
          .put(`${process.env.HTTP}/api/order/done/${id}`)
          .then(async (res) => {
            if (res['data'].order.user?._id) {
              await getOrderUser({ room: res['data'].order.user._id });
            }
            await getDoneOrder();
            await getConfirmedOrder();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('client:confirmedOrder', async (id) => {
      try {
        await axios
          .put(`${process.env.HTTP}/api/order/confirmed/${id}`)
          .then(async (res) => {
            if (res['data'].order.user?._id) {
              await getOrderUser({ room: res['data'].order.user._id });
            }
            await getConfirmedOrder();
            await getPendingOrder();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    });

    // ============ REVIEW EVENTS ============
    // Join room theo productId để nhận updates của sản phẩm đó
    socket.on('review:joinProduct', (productId) => {
      socket.join(`product:${productId}`);
      console.log(`Socket joined product room: ${productId}`);
    });

    // Leave product room
    socket.on('review:leaveProduct', (productId) => {
      socket.leave(`product:${productId}`);
      console.log(`Socket left product room: ${productId}`);
    });

    socket.on('disconnect', () => {
      // Gửi thông báo cho tất cả người dùng trong phòng
      io.emit('user left', `${socket.username} left the chat`);
    });
  });

  // Export io instance để dùng trong controllers
  global.io = io;
};
