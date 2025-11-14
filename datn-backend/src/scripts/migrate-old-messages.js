import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateOldMessages = async () => {
  try {
    // Kết nối database
    const dbUrl = process.env.MONGOOSE_URI || process.env.MONGOOSE_DB || process.env.MONGOOSE_LOCAL;
    if (!dbUrl) {
      throw new Error('Không tìm thấy MONGOOSE_URI trong .env');
    }
    await mongoose.connect(dbUrl);
    console.log('✅ Đã kết nối database');

    // Tìm TẤT CẢ messages (kể cả đã có conversationId)
    const allMessages = await Message.find({}).sort({ timestamp: 1, createdAt: 1 }).lean();
    console.log(`📝 Total messages in database: ${allMessages.length}`);
    
    if (allMessages.length > 0) {
      console.log('📌 Sample message:', JSON.stringify(allMessages[0], null, 2));
    }
    
    // Lấy những messages có username field hoặc reciever field (từ livechat cũ)
    const oldMessages = allMessages.filter(msg => {
      const hasUsername = msg.username !== undefined && msg.username !== null;
      const hasReciever = msg.reciever !== undefined && msg.reciever !== null;
      console.log(`Checking message ${msg._id}: username=${hasUsername}, reciever=${hasReciever}`);
      return hasUsername || hasReciever;
    });
    console.log(`📝 Messages from old livechat system: ${oldMessages.length}`);

    console.log(`📝 Tìm thấy ${oldMessages.length} tin nhắn cũ`);

    if (oldMessages.length === 0) {
      console.log('✅ Không có tin nhắn cũ nào cần migrate');
      process.exit(0);
    }

    // Hiển thị một vài tin nhắn để debug
    console.log('\n📌 Mẫu tin nhắn cũ (raw data):');
    oldMessages.slice(0, 3).forEach(msg => {
      console.log('  -', JSON.stringify(msg, null, 2));
    });

    // Group messages theo sender hoặc username (customer)
    const messagesByCustomer = {};
    
    for (const msg of oldMessages) {
      // Nếu đã có sender ID, dùng nó
      let customerId;
      if (msg.sender && mongoose.Types.ObjectId.isValid(msg.sender)) {
        customerId = msg.sender.toString();
      } else if (msg.username) {
        // Nếu chỉ có username, tìm user theo username
        const user = await User.findOne({ username: msg.username });
        customerId = user ? user._id.toString() : msg.username;
      } else {
        customerId = 'unknown';
      }

      if (!messagesByCustomer[customerId]) {
        messagesByCustomer[customerId] = [];
      }
      messagesByCustomer[customerId].push(msg);
    }

    console.log(`👥 Có ${Object.keys(messagesByCustomer).length} khách hàng`);

    // Tạo conversation cho mỗi customer
    for (const [customerId, messages] of Object.entries(messagesByCustomer)) {
      console.log(`\n🔄 Xử lý khách hàng ID: ${customerId}`);

      // Tìm customer
      let customer;
      if (mongoose.Types.ObjectId.isValid(customerId)) {
        customer = await User.findById(customerId);
        console.log(`  ✅ Tìm thấy user: ${customer?.username || 'N/A'}`);
      } else {
        // Tạo user mới nếu chưa tồn tại
        const username = messages[0].username || 'Unknown Customer';
        console.log(`  ➕ Tạo user mới cho ${username}`);
        customer = await User.create({
          username,
          account: `${username.replace(/\s/g, '_')}@temp.com`,
          password: 'temp_password_' + Date.now(),
          role: 'customer',
        });
      }
      
      if (!customer) {
        console.log(`  ❌ Không tìm thấy hoặc không thể tạo user, bỏ qua`);
        continue;
      }

      // Kiểm tra conversation đã tồn tại chưa
      let conversation = await Conversation.findOne({ 
        customer: customer._id 
      });

      if (!conversation) {
        // Tạo conversation mới
        console.log(`  ➕ Tạo conversation mới`);
        const lastMsgTime = messages[messages.length - 1].timestamp || 
                           messages[messages.length - 1].createdAt || 
                           new Date();
        
        conversation = await Conversation.create({
          customer: customer._id,
          participants: [customer._id],
          status: 'open',
          priority: 'medium',
          lastMessageTime: lastMsgTime,
          unreadCount: {
            admin: messages.length, // Đánh dấu tất cả là chưa đọc
            customer: 0
          }
        });
        console.log(`  ✅ Created conversation: ${conversation._id}`);
      } else {
        console.log(`  ℹ️ Conversation already exists: ${conversation._id}`);
      }

      // Cập nhật messages
      let updatedCount = 0;
      for (const msg of messages) {
        // Xác định sender và receiver dựa vào field reciever
        const isFromCustomer = !msg.reciever || 
                               (typeof msg.reciever === 'string' && msg.reciever.includes('Admin'));
        
        const updateData = {
          sender: customer._id,
          receiver: isFromCustomer ? null : customer._id, // null nếu gửi cho admin
          senderModel: isFromCustomer ? 'User' : 'Admin',
          conversationId: conversation._id.toString(),
          status: 'sent'
        };
        
        // Xóa field reciever (typo) nếu tồn tại
        if (msg.reciever) {
          updateData.$unset = { reciever: 1 };
        }
        
        await Message.findByIdAndUpdate(msg._id, updateData);
        updatedCount++;
      }

      // Cập nhật lastMessage của conversation
      const lastMsg = messages[messages.length - 1];
      const lastMsgTime = lastMsg.timestamp || lastMsg.createdAt || new Date();
      
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: lastMsg._id,
        lastMessageTime: lastMsgTime,
        'unreadCount.admin': messages.length, // Đánh dấu là chưa đọc
      });

      console.log(`  ✅ Đã migrate ${updatedCount} tin nhắn và cập nhật conversation`);
    }

    console.log('\n✅ Hoàn thành migration!');
    console.log('🎉 Bạn có thể kiểm tra lại dashboard admin bây giờ');
    
  } catch (error) {
    console.error('❌ Lỗi khi migrate:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Đã ngắt kết nối database');
    process.exit(0);
  }
};

// Chạy migration
migrateOldMessages();
