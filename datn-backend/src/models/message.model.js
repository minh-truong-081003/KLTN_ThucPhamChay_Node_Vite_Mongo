import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      default: '',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = gửi cho admin
    },
    senderModel: {
      type: String,
      enum: ['User', 'Admin'], // Phân biệt người gửi là khách hàng hay admin/nhân viên
      default: 'User',
    },
    conversationId: {
      type: String,
      required: true,
      index: true, // Tối ưu query theo cuộc hội thoại
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String, // URL của file đính kèm (ảnh, file)
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
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ status: 1 });

// Virtual để lấy thông tin người gửi
messageSchema.virtual('senderInfo', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true,
});

// Virtual để lấy thông tin người nhận
messageSchema.virtual('receiverInfo', {
  ref: 'User',
  localField: 'receiver',
  foreignField: '_id',
  justOne: true,
});

// Đảm bảo virtuals được bao gồm khi convert sang JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

messageSchema.plugin(mongoosePaginate);

const Message = mongoose.model('Message', messageSchema);

export default Message;
