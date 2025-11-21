import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const cartSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    items: [
      {
        image: {
          type: String,
          required: true,

        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          require: true,
        },
        size: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Size',
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    // products: [
    //   {
    //     productId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Product",
    //       required: true,
    //     },
    //     quantity: {
    //       type: Number,
    //       required: true,
    //     },
    //     price: {
    //       type: Number,
    //       require: true,
    //     },
    //   },
    // ],

    // totalAfterDiscount: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

cartSchema.plugin(mongoosePaginate);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
