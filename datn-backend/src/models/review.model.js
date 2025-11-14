import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false, // Không bắt buộc cho reply
    },
    rating: {
      type: Number,
      required: false, // Không bắt buộc cho reply (chỉ review gốc có rating)
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        publicId: String,
        filename: String,
      },
    ],
    // Reply review: nếu có parent_review thì đây là reply
    parent_review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Đảm bảo mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng
// Chỉ áp dụng cho review gốc (parent_review = null), không áp dụng cho reply
reviewSchema.index(
  { user: 1, product: 1, order: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { parent_review: null }
  }
);

reviewSchema.plugin(mongoosePaginate);

const Review = mongoose.model('Review', reviewSchema);

export default Review;

