import express from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const reviewRoutes = express.Router();

// Lấy tất cả đánh giá của một sản phẩm (public, nhưng lấy user nếu có token)
reviewRoutes.route('/reviews/product/:productId').get(authMiddleware.optionalAuth, reviewController.getReviewsByProduct);

// Kiểm tra user đã mua sản phẩm chưa (cần đăng nhập)
reviewRoutes
  .route('/reviews/check-purchase/:productId')
  .get(authMiddleware.verifyToken, reviewController.checkUserPurchasedProduct);

// Lấy đánh giá của user cho một sản phẩm (cần đăng nhập)
reviewRoutes
  .route('/reviews/user/product/:productId')
  .get(authMiddleware.verifyToken, reviewController.getUserReviewForProduct);

// Lấy danh sách reviews theo order ID (cần đăng nhập)
reviewRoutes
  .route('/reviews/order/:orderId')
  .get(authMiddleware.verifyToken, reviewController.getReviewsByOrder);

// Tạo đánh giá mới (cần đăng nhập)
reviewRoutes.route('/review').post(authMiddleware.verifyToken, reviewController.createReview);

// Cập nhật đánh giá (cần đăng nhập)
reviewRoutes.route('/review/:reviewId').put(authMiddleware.verifyToken, reviewController.updateReview);

// Xóa đánh giá (cần đăng nhập - chủ sở hữu, admin hoặc staff)
reviewRoutes.route('/review/:reviewId').delete(authMiddleware.verifyToken, reviewController.deleteReview);

// Ẩn/Hiện đánh giá (toggle is_active - chủ sở hữu, admin hoặc staff)
reviewRoutes.route('/review/:reviewId/toggle-visibility').patch(authMiddleware.verifyToken, reviewController.toggleReviewVisibility);

// Lấy tất cả đánh giá (cho admin và staff)
reviewRoutes.route('/reviews/all').get(authMiddleware.verifyTokenAdminOrStaff, reviewController.getAllReviews);

// Khôi phục đánh giá đã xóa (cho admin và staff)
reviewRoutes.route('/reviews/restore/:reviewId').put(authMiddleware.verifyTokenAdminOrStaff, reviewController.restoreReview);

// Xóa vĩnh viễn đánh giá (cho admin và staff)
reviewRoutes.route('/reviews/force-delete/:reviewId').delete(authMiddleware.verifyTokenAdminOrStaff, reviewController.forceDeleteReview);

// Tính lại rating cho tất cả sản phẩm (cho admin)
reviewRoutes.route('/reviews/recalculate-ratings').post(authMiddleware.verifyTokenAdmin, reviewController.recalculateAllProductRatings);

// Reply đánh giá (cho admin và staff)
reviewRoutes.route('/review/:reviewId/reply').post(authMiddleware.verifyTokenAdminOrStaff, reviewController.replyReview);

// Lấy tất cả replies của một review (public)
reviewRoutes.route('/reviews/:reviewId/replies').get(reviewController.getRepliesByReview);

export default reviewRoutes;

