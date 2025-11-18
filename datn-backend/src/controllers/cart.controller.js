import Cart from '../models/cart.model.js';
import { cartValidate } from '../validates/cart.js';

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
export const cartController = {
  /* create Cart */
  createCart: async (req, res) => {
    try {
      const { _id } = req.user;
      const { error } = cartValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'fail',
          err: error.details.map((err) => err.message),
        });
      }

      // Try to find a cart document for this user that matches the provided name (group by product name)
      const cart = await Cart.findOne({ user: _id, name: req.body.name }).populate([
        {
          path: 'items.toppings',
          select: 'name price _id',
        },
        {
          path: 'items.size',
          select: 'name price _id',
        },
      ]);

      if (cart) {
        for (let j = 0; j < req.body.items.length; j++) {
          const newItem = req.body.items[j];
          const existingItem = cart.items.find((item) => {
            try {
              return String(item.product) === String(newItem.product);
            } catch (e) {
              return item.product === newItem.product;
            }
          });

          if (existingItem) {
            // merge quantities and totals
            existingItem.quantity += newItem.quantity;
            // prefer adding newItem.total to preserve toppings/size calculations
            existingItem.total = (existingItem.total || 0) + (newItem.total || newItem.price * newItem.quantity || 0);
          } else {
            cart.items.push(newItem);
          }
        }

        await cart.save();
      } else {
        // use provided name if available, fallback to 'Cart'
        await new Cart({
          user: _id,
          name: req.body.name || 'Cart',
          items: req.body.items,
        }).save();
      }

      return res.status(200).json({
        message: 'success',
        data: req.body,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'fail',
        err: 'Server error',
      });
    }
  },
  /* get all Cart */
  getAllCart: async (req, res) => {
    try {
      const { _id } = req.user;
      const cartAll = await Cart.find({ user: _id })
        .populate([
          // {
          //   path: 'items.product',
          //   select: 'name',
          //   select: '-is_deleted -is_active -createdAt -updatedAt',
          //   select: '_id',
          // },
          {
            path: 'items.toppings',
            // select: '-isActive -isDeleted -updatedAt -products'
            select: 'name price _id',
          },
          {
            path: 'items.size',
            // select: '-is_deleted -is_active -createdAt'
            select: 'name price _id',
          },
        ])
        .select('-user')
        .exec();

      return res.json({
        message: 'Cart all successfully',
        data: cartAll,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  /* get one Cart */
  getOneCart: async (req, res) => {
    try {
      const { _id } = req.user;

      const cart = await Cart.findOne({
        user: _id,
        _id: req.params.id,
      })
        .populate([
          // {
          // path: 'items.product',
          // select: '-is_deleted -is_active -createdAt -updatedAt',
          // select: '_id',
          // },
          {
            path: 'items.toppings',
            // select: '-isActive -isDeleted -updatedAt -products'
            select: 'name price _id',
          },
          {
            path: 'items.size',
            // select: '-is_deleted -is_active -createdAt'
            select: 'name price _id',
          },
        ])
        .select('-user')
        .exec();
      res.json({
        message: 'Cart successfully',
        data: cart,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  /* update Cart */
  updateCart: async (req, res) => {
    try {
      // lay id header, id product, quantity,   total
      const { _id } = req.user;
      const { quantity: newQuantity, id: idProduct, total: newTotal } = req.body;

      const getCart = await Cart.findOne({
        user: _id,
        _id: req.params.id,
      });

      if (getCart) {
        const cartItem = getCart.items.find((item) => item?._id == idProduct);

        if (cartItem) {
          if (newQuantity == 0) {
            getCart.items = getCart.items.filter((item) => item._id != idProduct);

          } else {
            cartItem.quantity = newQuantity;
            
            cartItem.total = newTotal;
          }
          await getCart.save();

        } else {
          return res.status(400).json({
            message: 'fail',
            err: 'Cart item not found',
          });
        }
      } else {
        return res.status(400).json({
          message: 'fail',
          err: 'Cart not found',
        });
      }

      // Check if all items are removed from the cart
      const hasItems = getCart.items.length > 0;

      if (!hasItems) {
        await Cart.findByIdAndRemove(getCart._id);
      }
      return res.status(200).json({
        message: 'success',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  /* delete Cart */
  deleteCart: async (req, res) => {
    try {
      const { _id } = req.user;
      const { cartItemId } = req.params;
      const deleteProducts = await Cart.deleteOne({
        user: _id,
        _id: cartItemId,
      });

      return res.json({
        message: 'delete success',
        data: deleteProducts,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
