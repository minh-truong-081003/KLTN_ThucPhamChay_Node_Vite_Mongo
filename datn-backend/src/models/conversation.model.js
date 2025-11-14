import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Admin/nhân viên được assign
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    unreadCount: {
      admin: {
        type: Number,
        default: 0,
      },
      customer: {
        type: Number,
        default: 0,
      },
    },
    tags: [
      {
        type: String,
      },
    ],
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tối ưu query
conversationSchema.index({ customer: 1, status: 1 });
conversationSchema.index({ assignedStaff: 1, status: 1 });
conversationSchema.index({ lastMessageTime: -1 });
conversationSchema.index({ status: 1, priority: -1, lastMessageTime: -1 });

// Method để cập nhật unread count
conversationSchema.methods.incrementUnreadCount = async function (recipient) {
  if (recipient === 'admin') {
    this.unreadCount.admin += 1;
  } else if (recipient === 'customer') {
    this.unreadCount.customer += 1;
  }
  return this.save();
};

conversationSchema.methods.resetUnreadCount = async function (recipient) {
  if (recipient === 'admin') {
    this.unreadCount.admin = 0;
  } else if (recipient === 'customer') {
    this.unreadCount.customer = 0;
  }
  return this.save();
};

conversationSchema.plugin(mongoosePaginate);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
