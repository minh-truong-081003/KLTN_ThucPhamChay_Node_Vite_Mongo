import express from 'express';
import { favoriteController } from '../controllers/favorite.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả routes yêu thích đều cần đăng nhập
router.use(authMiddleware.verifyToken);

// Thêm vào yêu thích
router.post('/favorites', favoriteController.addToFavorites);

// Xóa khỏi yêu thích
router.delete('/favorites/:productId', favoriteController.removeFromFavorites);

// Lấy danh sách yêu thích
router.get('/favorites', favoriteController.getUserFavorites);

// Kiểm tra sản phẩm có được yêu thích không
router.get('/favorites/check/:productId', favoriteController.checkFavorite);

export default router;