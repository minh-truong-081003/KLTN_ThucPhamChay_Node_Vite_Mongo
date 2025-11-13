import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { reviewValidate, updateReviewValidate } from '../validates/review.validate.js';

export const reviewController = {
  // Tạo đánh giá mới
  createReview: async (req, res, next) => {
    try {
      const { error } = reviewValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'fail',
          err: error.details.map((err) => err.message),
        });
      }

      const userId = req.user._id;
      const { product, order, rating, comment, images } = req.body;

      // Kiểm tra đơn hàng có tồn tại và thuộc về user này không
      const orderData = await Order.findById(order);
      if (!orderData) {
        return res.status(404).json({ message: 'fail', err: 'Order not found' });
      }

      // Kiểm tra đơn hàng có thuộc về user này không
      if (orderData.user?.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'fail', err: 'You are not authorized to review this order' });
      }

      // Kiểm tra đơn hàng đã hoàn thành chưa (chỉ cho phép đánh giá sau khi đã nhận hàng)
      if (!['done'].includes(orderData.status)) {
        return res.status(400).json({
          message: 'fail',
          err: 'You can only review products after receiving them (order status must be "done")',
        });
      }

      // Kiểm tra sản phẩm có trong đơn hàng không
      const productInOrder = orderData.items.find((item) => item.product?.toString() === product);
      if (!productInOrder) {
        return res.status(400).json({
          message: 'fail',
          err: 'This product is not in your order',
        });
      }

      // Kiểm tra đã đánh giá sản phẩm này trong đơn hàng này chưa
      const existingReview = await Review.findOne({
        user: userId,
        product,
        order,
      });

      if (existingReview) {
        return res.status(400).json({
          message: 'fail',
          err: 'You have already reviewed this product for this order',
        });
      }

      // Tạo đánh giá mới
      const review = await Review.create({
        user: userId,
        product,
        order,
        rating,
        comment: comment || '',
        images: images || [],
      });

      // Cập nhật rating trung bình của sản phẩm
      await reviewController.updateProductRating(product);

      return res.status(200).json({ message: 'success', data: review });
    } catch (error) {
      next(error);
    }
  },

  // Lấy tất cả đánh giá của một sản phẩm
  getReviewsByProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { _page = 1, _limit = 10, rating } = req.query;

      let query = {
        product: productId,
        is_deleted: false,
        is_active: true,
      };

      // Lọc theo rating nếu có
      if (rating) {
        query.rating = parseInt(rating);
      }

      const options = {
        page: parseInt(_page),
        limit: parseInt(_limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'user', select: 'username avatar account' },
          { path: 'order', select: 'status createdAt' },
        ],
      };

      const reviews = await Review.paginate(query, options);

      return res.status(200).json({ ...reviews });
    } catch (error) {
      next(error);
    }
  },

  // Lấy đánh giá của user cho một sản phẩm
  getUserReviewForProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(200).json({ message: 'success', data: null });
      }

      const review = await Review.findOne({
        user: userId,
        product: productId,
        is_deleted: false,
      }).populate([
        { path: 'user', select: 'username avatar account' },
        { path: 'order', select: 'status createdAt' },
      ]);

      return res.status(200).json({ message: 'success', data: review });
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật đánh giá
  updateReview: async (req, res, next) => {
    try {
      const { error } = updateReviewValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'fail',
          err: error.details.map((err) => err.message),
        });
      }

      const { reviewId } = req.params;
      const userId = req.user._id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Kiểm tra quyền sở hữu
      if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'fail', err: 'You are not authorized to update this review' });
      }

      const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, { new: true }).populate([
        { path: 'user', select: 'username avatar account' },
        { path: 'order', select: 'status createdAt' },
      ]);

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      return res.status(200).json({ message: 'success', data: updatedReview });
    } catch (error) {
      next(error);
    }
  },

  // Xóa đánh giá (soft delete)
  deleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Kiểm tra quyền: chủ sở hữu, admin hoặc staff
      const isOwner = review.user.toString() === userId.toString();
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isOwner && !isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Bạn không có quyền xóa đánh giá này' 
        });
      }

      const deletedReview = await Review.findByIdAndUpdate(
        reviewId,
        { is_deleted: true, is_active: false },
        { new: true }
      );

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      return res.status(200).json({ message: 'success', data: deletedReview });
    } catch (error) {
      next(error);
    }
  },

  // Ẩn/Hiện đánh giá (toggle is_active)
  toggleReviewVisibility: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Kiểm tra quyền: chủ sở hữu, admin hoặc staff
      const isOwner = review.user.toString() === userId.toString();
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isOwner && !isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Bạn không có quyền thay đổi trạng thái đánh giá này' 
        });
      }

      // Toggle is_active
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { is_active: !review.is_active },
        { new: true }
      ).populate([
        { path: 'user', select: 'username avatar account' },
        { path: 'order', select: 'status createdAt' },
      ]);

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      return res.status(200).json({ 
        message: 'success', 
        data: updatedReview,
        status: updatedReview.is_active ? 'Đã hiển thị' : 'Đã ẩn'
      });
    } catch (error) {
      next(error);
    }
  },

  // Lấy tất cả đánh giá (cho admin)
  getAllReviews: async (req, res, next) => {
    try {
      const { _page = 1, _limit = 10, productId, userId, rating, is_active, is_deleted } = req.query;

      let query = {};

      // Nếu không chỉ định is_deleted, mặc định chỉ lấy các review chưa xóa
      if (is_deleted !== undefined) {
        query.is_deleted = is_deleted === 'true';
      } else {
        query.is_deleted = false;
      }

      if (productId) query.product = productId;
      if (userId) query.user = userId;
      if (rating) query.rating = parseInt(rating);
      if (is_active !== undefined) query.is_active = is_active === 'true';

      const options = {
        page: parseInt(_page),
        limit: parseInt(_limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'user', select: 'username avatar account phone' },
          { path: 'product', select: 'name images' },
          { path: 'order', select: 'status createdAt total' },
        ],
      };

      const reviews = await Review.paginate(query, options);

      return res.status(200).json({ ...reviews });
    } catch (error) {
      next(error);
    }
  },

  // Kiểm tra user đã mua sản phẩm chưa
  checkUserPurchasedProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(200).json({ message: 'success', data: { canReview: false } });
      }

      // Tìm đơn hàng có chứa sản phẩm này (chỉ cho phép đánh giá sau khi đã nhận hàng)
      // Chỉ cho phép đánh giá khi đơn hàng ở trạng thái "done" (đã hoàn thành)
      const order = await Order.findOne({
        user: userId,
        status: 'done',
        'items.product': productId,
      });

      const canReview = !!order;
      const orderId = order ? order._id.toString() : undefined;

      // Kiểm tra xem user đã đánh giá sản phẩm này trong đơn hàng này chưa
      if (order) {
        const existingReview = await Review.findOne({
          user: userId,
          product: productId,
          order: order._id,
          is_deleted: false,
        });

        if (existingReview) {
          return res.status(200).json({
            message: 'success',
            data: { canReview: false, orderId, alreadyReviewed: true },
          });
        }
      }

      return res.status(200).json({ message: 'success', data: { canReview, orderId } });
    } catch (error) {
      next(error);
    }
  },

  // Lấy danh sách reviews theo order ID
  getReviewsByOrder: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const userId = req.user?._id;

      // Kiểm tra đơn hàng có tồn tại và thuộc về user này không
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'fail', err: 'Order not found' });
      }

      if (order.user?.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'fail', err: 'You are not authorized to view reviews for this order' });
      }

      // Lấy tất cả reviews của đơn hàng này
      const reviews = await Review.find({
        order: orderId,
        user: userId,
        is_deleted: false,
      }).populate([
        { path: 'product', select: 'name images' },
      ]);

      return res.status(200).json({ 
        message: 'success', 
        data: reviews 
      });
    } catch (error) {
      next(error);
    }
  },

  // Hàm helper: Cập nhật rating trung bình của sản phẩm
  updateProductRating: async (productId) => {
    try {
      const reviews = await Review.find({
        product: productId,
        is_deleted: false,
        is_active: true,
      });

      if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: 0,
          totalReviews: 0,
        });
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          averageRating: averageRating,
          totalReviews: reviews.length,
        },
        { new: true }
      );

      console.log(`Updated product ${productId}: averageRating=${averageRating}, totalReviews=${reviews.length}`);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product rating:', error);
      throw error;
    }
  },

  // Khôi phục đánh giá đã xóa (cho admin/staff)
  restoreReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userRole = req.user.role;

      // Kiểm tra quyền admin hoặc staff
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Bạn không có quyền khôi phục đánh giá' 
        });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      const restoredReview = await Review.findByIdAndUpdate(
        reviewId,
        { is_deleted: false, is_active: true },
        { new: true }
      );

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      return res.status(200).json({ message: 'success', data: restoredReview });
    } catch (error) {
      next(error);
    }
  },

  // Xóa vĩnh viễn đánh giá (cho admin)
  forceDeleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Xóa vĩnh viễn khỏi database
      await Review.findByIdAndDelete(reviewId);

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      return res.status(200).json({ 
        message: 'success', 
        data: { message: 'Đã xóa vĩnh viễn đánh giá' }
      });
    } catch (error) {
      next(error);
    }
  },

  // Tính lại rating cho tất cả sản phẩm (admin only)
  recalculateAllProductRatings: async (req, res, next) => {
    try {
      const products = await Product.find({});
      let updatedCount = 0;

      for (const product of products) {
        await reviewController.updateProductRating(product._id);
        updatedCount++;
      }

      return res.status(200).json({
        message: 'success',
        data: { updatedCount, message: `Đã cập nhật rating cho ${updatedCount} sản phẩm` },
      });
    } catch (error) {
      next(error);
    }
  },
};

