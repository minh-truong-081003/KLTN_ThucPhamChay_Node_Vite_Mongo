import Favorite from '../models/favorite.model.js';
import Product from '../models/product.model.js';

export const favoriteController = {
  // Thêm sản phẩm vào danh sách yêu thích
  addToFavorites: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user._id;

      console.log('Adding favorite for user:', userId, 'product:', productId);

      // Kiểm tra sản phẩm có tồn tại không
      const product = await Product.findById(productId);
      if (!product || product.is_deleted || !product.is_active) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc không khả dụng' });
      }

      // Kiểm tra đã yêu thích chưa
      const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
      if (existingFavorite) {
        return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
      }

      // Thêm vào yêu thích
      const favorite = await Favorite.create({ user: userId, product: productId });

      console.log('Favorite added:', favorite._id);

      return res.status(201).json({
        message: 'Đã thêm vào danh sách yêu thích',
        favorite
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Xóa sản phẩm khỏi danh sách yêu thích
  removeFromFavorites: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      const favorite = await Favorite.findOneAndDelete({ user: userId, product: productId });

      if (!favorite) {
        return res.status(404).json({ message: 'Sản phẩm không có trong danh sách yêu thích' });
      }

      return res.status(200).json({ message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Lấy danh sách sản phẩm yêu thích của user
  getUserFavorites: async (req, res) => {
    try {
      const userId = req.user._id;
      const { _page = 1, _limit = 10 } = req.query;

      console.log('Getting favorites for user:', userId);

      const options = {
        page: _page,
        limit: _limit,
        populate: {
          path: 'product'
        },
        sort: { createdAt: -1 }
      };

      const favorites = await Favorite.paginate({ user: userId }, options);

      console.log('Favorites docs:', favorites.docs.map(f => ({ id: f._id, product: f.product?._id || 'null' })));

      return res.status(200).json({
        message: 'Lấy danh sách yêu thích thành công',
        favorites
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Kiểm tra sản phẩm có được yêu thích không
  checkFavorite: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      const favorite = await Favorite.findOne({ user: userId, product: productId });

      return res.status(200).json({
        isFavorite: !!favorite
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};