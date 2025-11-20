import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const favoriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true, versionKey: false }
);

// Đảm bảo một user không thể yêu thích cùng một sản phẩm nhiều lần
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

favoriteSchema.plugin(mongoosePaginate);

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;