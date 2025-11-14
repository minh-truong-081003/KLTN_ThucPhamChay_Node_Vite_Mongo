import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

// Tạo hoặc lấy conversation giữa customer và admin
export const getOrCreateConversation = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?._id || customerId;

    // Kiểm tra user tồn tại
    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Tìm hoặc tạo conversation
    let conversation = await Conversation.findOne({
      customer: userId,
      status: { $ne: 'closed' },
    })
      .populate('customer', 'username email avatar')
      .populate('assignedStaff', 'username email avatar')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        customer: userId,
        participants: [userId],
        status: 'open',
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('customer', 'username email avatar')
        .populate('assignedStaff', 'username email avatar');
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo cuộc hội thoại',
      error: error.message,
    });
  }
};

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, attachments } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role || 'user';

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết',
      });
    }

    // Tìm conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Cuộc hội thoại không tồn tại',
      });
    }

    // Xác định người nhận và loại người gửi
    let receiverId = null;
    let senderModel = 'User';

    if (senderRole === 'admin' || senderRole === 'staff') {
      receiverId = conversation.customer;
      senderModel = 'Admin';
      // Update assigned staff nếu chưa có
      if (!conversation.assignedStaff) {
        conversation.assignedStaff = senderId;
      }
      // Tăng unread count cho customer
      await conversation.incrementUnreadCount('customer');
    } else {
      receiverId = conversation.assignedStaff;
      senderModel = 'User';
      // Tăng unread count cho admin
      await conversation.incrementUnreadCount('admin');
    }

    // Tạo message
    const message = await Message.create({
      text,
      sender: senderId,
      receiver: receiverId,
      senderModel,
      conversationId,
      attachments: attachments || [],
      status: 'sent',
    });

    // Populate thông tin người gửi
    await message.populate('sender', 'username email avatar');
    if (receiverId) {
      await message.populate('receiver', 'username email avatar');
    }

    // Cập nhật conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    
    // Nếu customer gửi tin nhắn mới và conversation đã resolved/closed, chuyển về open (Mới)
    if (senderModel === 'User' && (conversation.status === 'resolved' || conversation.status === 'closed')) {
      conversation.status = 'open';
    }
    // Nếu admin gửi tin nhắn và conversation đã resolved/closed, chuyển về in-progress
    else if (senderModel === 'Admin' && (conversation.status === 'resolved' || conversation.status === 'closed')) {
      conversation.status = 'in-progress';
    }
    
    await conversation.save();

    // Emit socket event
    if (global.io) {
      // Convert message to plain object để emit
      const messageData = message.toObject();
      
      console.log('🚀 Emitting new-message to conversation:', conversationId);
      console.log('📦 Message data:', { 
        id: messageData._id, 
        text: messageData.text, 
        senderModel: messageData.senderModel,
        sender: messageData.sender,
        unreadCount: conversation.unreadCount
      });

      // Emit tới conversation room (cho cả 2 bên)
      global.io.to(conversationId).emit('new-message', {
        message: messageData,
        conversationId,
      });

      // Gửi cho tất cả admin/staff nếu người gửi là customer (để update sidebar)
      if (senderModel === 'User') {
        console.log('📨 Emitting to admin-room for new customer message');
        console.log('📊 Unread count for admin:', conversation.unreadCount.admin);
        
        // Emit vào room admin-room
        global.io.to('admin-room').emit('new-customer-message', {
          message: messageData,
          conversationId,
          conversation: conversation.toObject(),
        });
        
        // THÊM: Broadcast cho tất cả client để đảm bảo admin nhận được
        global.io.emit('admin:new-message', {
          message: messageData,
          conversationId,
          conversation: conversation.toObject(),
        });
      }
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi tin nhắn',
      error: error.message,
    });
  }
};

// Lấy danh sách tin nhắn của một conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'sender', select: 'username email avatar' },
        { path: 'receiver', select: 'username email avatar' },
      ],
    };

    const messages = await Message.paginate({ conversationId }, options);

    // Đảo ngược để hiển thị từ cũ đến mới
    messages.docs = messages.docs.reverse();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tin nhắn',
      error: error.message,
    });
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role || 'user';

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Cuộc hội thoại không tồn tại',
      });
    }

    // Cập nhật status của messages
    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read' },
      }
    );

    // Reset unread count
    if (userRole === 'admin' || userRole === 'staff') {
      await conversation.resetUnreadCount('admin');
    } else {
      await conversation.resetUnreadCount('customer');
    }

    // Emit socket event
    if (global.io) {
      // Emit tới conversation room
      global.io.to(conversationId).emit('messages-read', {
        conversationId,
        readBy: userId,
      });

      // Emit tới admin-room để update sidebar
      if (userRole === 'admin' || userRole === 'staff') {
        global.io.to('admin-room').emit('messages-read', {
          conversationId,
          readBy: userId,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tin nhắn đã đọc',
    });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tin nhắn',
      error: error.message,
    });
  }
};

// Lấy danh sách conversations cho admin/staff
export const getConversationsForAdmin = async (req, res) => {
  try {
    console.log('🔍 getConversationsForAdmin - req.user:', req.user);
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search theo tên khách hàng
    if (search) {
      const customers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { account: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.customer = { $in: customers.map((c) => c._id) };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { lastMessageTime: -1 },
      populate: [
        { path: 'customer', select: 'username account avatar' },
        { path: 'assignedStaff', select: 'username account avatar' },
        {
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'username account avatar',
          },
        },
      ],
    };

    const conversations = await Conversation.paginate(query, options);

    console.log(`📋 Found ${conversations.docs.length} conversations for admin`);
    if (conversations.docs.length > 0) {
      console.log('📌 First conversation:', {
        id: conversations.docs[0]._id,
        customer: conversations.docs[0].customer,
        status: conversations.docs[0].status,
      });
    }

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error in getConversationsForAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cuộc hội thoại',
      error: error.message,
    });
  }
};

// Lấy conversation theo ID (cho admin)
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('customer', 'username email avatar account')
      .populate('assignedStaff', 'username email avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username email avatar',
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc hội thoại',
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error in getConversationById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cuộc hội thoại',
      error: error.message,
    });
  }
};

// Lấy conversation của customer hiện tại
export const getConversationForCustomer = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      customer: userId,
    })
      .populate('customer', 'username email avatar')
      .populate('assignedStaff', 'username email avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username email avatar',
        },
      })
      .sort({ lastMessageTime: -1 });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có cuộc hội thoại nào',
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error in getConversationForCustomer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cuộc hội thoại',
      error: error.message,
    });
  }
};

// Cập nhật trạng thái conversation
export const updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, priority, tags } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Cuộc hội thoại không tồn tại',
      });
    }

    if (status) conversation.status = status;
    if (priority) conversation.priority = priority;
    if (tags) conversation.tags = tags;

    await conversation.save();

    // Emit socket event
    if (global.io) {
      global.io.to(conversationId).emit('conversation-updated', conversation);
    }

    res.status(200).json({
      success: true,
      data: conversation,
      message: 'Cập nhật cuộc hội thoại thành công',
    });
  } catch (error) {
    console.error('Error in updateConversationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật cuộc hội thoại',
      error: error.message,
    });
  }
};

// Assign staff cho conversation
export const assignStaffToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { staffId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Cuộc hội thoại không tồn tại',
      });
    }

    // Kiểm tra staff có tồn tại và là admin/staff
    const staff = await User.findById(staffId).populate('role');
    if (!staff || (staff.role?.name !== 'admin' && staff.role?.name !== 'staff')) {
      return res.status(400).json({
        success: false,
        message: 'Nhân viên không hợp lệ',
      });
    }

    conversation.assignedStaff = staffId;
    if (conversation.status === 'open') {
      conversation.status = 'in-progress';
    }

    // Thêm staff vào participants nếu chưa có
    if (!conversation.participants.includes(staffId)) {
      conversation.participants.push(staffId);
    }

    await conversation.save();

    // Emit socket event
    if (global.io) {
      global.io.to(staffId.toString()).emit('conversation-assigned', conversation);
      global.io.to(conversationId).emit('staff-assigned', {
        conversationId,
        staff: {
          _id: staff._id,
          username: staff.username,
          email: staff.email,
          avatar: staff.avatar,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
      message: 'Đã assign nhân viên thành công',
    });
  } catch (error) {
    console.error('Error in assignStaffToConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi assign nhân viên',
      error: error.message,
    });
  }
};

// Lấy số lượng tin nhắn chưa đọc
export const getUnreadCount = async (req, res) => {
  try {
    console.log('🔍 getUnreadCount - req.user:', req.user);
    const userId = req.user._id;
    // Xử lý role có thể là string hoặc object
    const userRole = typeof req.user.role === 'object' ? req.user.role?.name : req.user.role;
    console.log('🔍 getUnreadCount - userRole:', userRole);

    let unreadCount = 0;

    if (userRole === 'admin' || userRole === 'staff') {
      // Đếm tổng unread từ tất cả conversations
      const conversations = await Conversation.find({
        status: { $ne: 'closed' },
      });

      unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount.admin, 0);
    } else {
      // Đếm unread của customer
      const conversation = await Conversation.findOne({
        customer: userId,
      });

      unreadCount = conversation ? conversation.unreadCount.customer : 0;
    }

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số tin nhắn chưa đọc',
      error: error.message,
    });
  }
};

// Xóa tin nhắn (soft delete - chỉ ẩn khỏi người dùng)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Tin nhắn không tồn tại',
      });
    }

    // Chỉ người gửi mới được xóa
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin nhắn này',
      });
    }

    await Message.findByIdAndDelete(messageId);

    // Emit socket event
    if (global.io) {
      global.io.to(message.conversationId).emit('message-deleted', {
        messageId,
        conversationId: message.conversationId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa tin nhắn',
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tin nhắn',
      error: error.message,
    });
  }
};
