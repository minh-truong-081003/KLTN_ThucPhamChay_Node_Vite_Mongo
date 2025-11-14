import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { reviewValidate, updateReviewValidate, replyReviewValidate } from '../validates/review.validate.js';

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

      // Populate user và order để trả về đầy đủ thông tin
      const newReview = await Review.findById(review._id).populate([
        { path: 'user', select: 'username avatar account' },
        { path: 'order', select: 'status createdAt' },
      ]);

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(product);

      // Emit socket event
      if (global.io) {
        global.io.emit('review:created', { 
          reviewId: newReview._id, 
          productId: product.toString() 
        });
        global.io.to(`product:${product}`).emit('review:created', { 
          reviewId: newReview._id,
          productId: product.toString()
        });
      }

      return res.status(201).json({ message: 'success', data: newReview });
    } catch (error) {
      next(error);
    }
  },

  // Lấy tất cả đánh giá của một sản phẩm
  getReviewsByProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { _page = 1, _limit = 10, rating } = req.query;
      const userId = req.user?._id; // Lấy user hiện tại nếu đăng nhập

      // Query cho đánh giá công khai (active và chưa xóa) - CHỈ LẤY REVIEW GỐC (không có parent_review)
      let publicQuery = {
        product: productId,
        is_deleted: false,
        is_active: true,
        parent_review: null, // Chỉ lấy review gốc, không lấy replies
      };

      // Lọc theo rating nếu có
      if (rating) {
        publicQuery.rating = parseInt(rating);
      }

      const options = {
        page: parseInt(_page),
        limit: parseInt(_limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'user', select: 'username avatar account role' },
          { path: 'order', select: 'status createdAt' },
        ],
      };

      // Lấy các đánh giá công khai (chỉ review gốc)
      const reviews = await Review.paginate(publicQuery, options);

      // Lấy replies cho mỗi review
      for (let review of reviews.docs) {
        const replies = await Review.find({
          parent_review: review._id,
          is_deleted: false,
        })
          .populate([
            { path: 'user', select: 'username avatar account role' },
          ])
          .sort({ createdAt: 1 });
        
        // Thêm replies vào review object
        review._doc.replies = replies;
      }

      // Nếu user đăng nhập, thêm đánh giá ẩn của chính họ (nếu có)
      if (userId) {
        const userHiddenReview = await Review.findOne({
          product: productId,
          user: userId,
          is_deleted: false,
          is_active: false,
          parent_review: null, // Chỉ lấy review gốc
        }).populate([
          { path: 'user', select: 'username avatar account role' },
          { path: 'order', select: 'status createdAt' },
        ]);

        // Nếu có đánh giá ẩn của user, thêm vào đầu danh sách
        if (userHiddenReview) {
          // Lấy replies cho review ẩn này
          const replies = await Review.find({
            parent_review: userHiddenReview._id,
            is_deleted: false,
          })
            .populate([
              { path: 'user', select: 'username avatar account role' },
            ])
            .sort({ createdAt: 1 });
          
          userHiddenReview._doc.replies = replies;

          // Kiểm tra xem đã có trong kết quả chưa
          const existsInResults = reviews.docs.some(
            (r) => r._id.toString() === userHiddenReview._id.toString()
          );

          if (!existsInResults) {
            reviews.docs.unshift(userHiddenReview);
            reviews.totalDocs += 1;
          }
        }
      }

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

      // Emit socket event
      if (global.io) {
        global.io.emit('review:updated', { 
          reviewId, 
          productId: review.product.toString() 
        });
        global.io.to(`product:${review.product}`).emit('review:updated', { reviewId });
      }

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

      // Kiểm tra quyền: chủ sở hữu, admin hoặc staff (nhân viên)
      const isOwner = review.user.toString() === userId.toString();
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isOwner && !isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Bạn không có quyền xóa đánh giá này' 
        });
      }

      // Tất cả đều soft delete (is_deleted = true, is_active = false)
      const deletedReview = await Review.findByIdAndUpdate(
        reviewId,
        { is_deleted: true, is_active: false },
        { new: true }
      );

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      // Emit socket event
      if (global.io) {
        global.io.emit('review:deleted', { 
          reviewId, 
          productId: review.product.toString(),
          is_deleted: true 
        });
        global.io.to(`product:${review.product}`).emit('review:updated', { reviewId });
      }

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

      // Kiểm tra quyền: chủ sở hữu, admin hoặc staff (nhân viên)
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

      // Emit socket event
      if (global.io) {
        global.io.emit('review:toggled', { 
          reviewId: reviewId, 
          productId: review.product.toString(),
          is_active: updatedReview.is_active
        });
        global.io.to(`product:${review.product}`).emit('review:toggled', { 
          reviewId: reviewId,
          productId: review.product.toString(),
          is_active: updatedReview.is_active
        });
      }

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

      let query = {
        parent_review: null, // Chỉ lấy review gốc, không lấy replies
      };

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
          { path: 'user', select: 'username avatar account phone role' },
          { path: 'product', select: 'name images' },
          { path: 'order', select: 'status createdAt total' },
        ],
      };

      const reviews = await Review.paginate(query, options);

      // Lấy số lượng replies cho mỗi review
      for (let review of reviews.docs) {
        const repliesCount = await Review.countDocuments({
          parent_review: review._id,
          is_deleted: false,
        });
        review._doc.repliesCount = repliesCount;
      }

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
      // CHỈ LẤY REVIEW GỐC (parent_review = null), KHÔNG LẤY REPLIES
      const reviews = await Review.find({
        product: productId,
        is_deleted: false,
        is_active: true,
        parent_review: null, // Chỉ lấy review gốc có rating
      });

      if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: 0,
          totalReviews: 0,
        });
        return;
      }

      // Lọc các reviews có rating (để chắc chắn)
      const validReviews = reviews.filter(review => review.rating != null);
      
      if (validReviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: 0,
          totalReviews: 0,
        });
        return;
      }

      const totalRating = validReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = parseFloat((totalRating / validReviews.length).toFixed(1));

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          averageRating: averageRating,
          totalReviews: validReviews.length,
        },
        { new: true }
      );

      console.log(`Updated product ${productId}: averageRating=${averageRating}, totalReviews=${validReviews.length}`);
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

      // Kiểm tra quyền admin hoặc staff (nhân viên)
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
        { is_deleted: false },
        { new: true }
      );

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      // Emit socket event
      if (global.io) {
        global.io.emit('review:restored', { 
          reviewId, 
          productId: review.product.toString() 
        });
        global.io.to(`product:${review.product}`).emit('review:updated', { reviewId });
      }

      return res.status(200).json({ message: 'success', data: restoredReview });
    } catch (error) {
      next(error);
    }
  },

  // Xóa vĩnh viễn đánh giá (cho admin và staff)
  forceDeleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userRole = req.user.role;

      // Kiểm tra quyền admin hoặc staff (nhân viên)
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Bạn không có quyền xóa vĩnh viễn đánh giá' 
        });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Xóa vĩnh viễn khỏi database
      await Review.findByIdAndDelete(reviewId);

      // Cập nhật lại rating trung bình của sản phẩm
      await reviewController.updateProductRating(review.product);

      // Emit socket event
      if (global.io) {
        global.io.emit('review:forceDeleted', { 
          reviewId: reviewId, 
          productId: review.product.toString()
        });
        global.io.to(`product:${review.product}`).emit('review:forceDeleted', { 
          reviewId: reviewId,
          productId: review.product.toString()
        });
      }

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

  // Reply đánh giá (cho admin và staff)
  replyReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Kiểm tra quyền: chỉ admin hoặc staff mới được reply
      const isAdmin = userRole === 'admin';
      const isStaff = userRole === 'staff';

      if (!isAdmin && !isStaff) {
        return res.status(403).json({ 
          message: 'fail', 
          err: 'Chỉ admin và nhân viên mới có thể trả lời đánh giá' 
        });
      }

      // Validate
      const { error } = replyReviewValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'fail',
          err: error.details.map((err) => err.message),
        });
      }

      // Kiểm tra review gốc có tồn tại không
      const parentReview = await Review.findById(reviewId);
      if (!parentReview) {
        return res.status(404).json({ message: 'fail', err: 'Review not found' });
      }

      // Không cho phép reply một reply
      if (parentReview.parent_review) {
        return res.status(400).json({ 
          message: 'fail', 
          err: 'Không thể trả lời một câu trả lời. Chỉ có thể trả lời đánh giá gốc.' 
        });
      }

      const { comment, images } = req.body;

      // Tạo reply (không có rating, không có order)
      // Lưu ý: Không set order và rating để tránh conflict với unique index
      const replyData = {
        user: userId,
        product: parentReview.product,
        parent_review: reviewId,
        comment,
        images: images || [],
      };

      const reply = await Review.create(replyData);

      // Populate để trả về đầy đủ thông tin
      const newReply = await Review.findById(reply._id).populate([
        { path: 'user', select: 'username avatar account role' },
        { path: 'parent_review', select: '_id comment rating' },
      ]);

      // Emit socket event
      if (global.io) {
        global.io.emit('review:replied', { 
          replyId: newReply._id,
          parentReviewId: reviewId,
          productId: parentReview.product.toString() 
        });
        global.io.to(`product:${parentReview.product}`).emit('review:replied', { 
          replyId: newReply._id,
          parentReviewId: reviewId,
          productId: parentReview.product.toString()
        });
      }

      return res.status(201).json({ message: 'success', data: newReply });
    } catch (error) {
      next(error);
    }
  },

  // Lấy tất cả replies của một review
  getRepliesByReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;

      const replies = await Review.find({
        parent_review: reviewId,
        is_deleted: false,
      })
        .populate([
          { path: 'user', select: 'username avatar account role' },
        ])
        .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tăng dần

      return res.status(200).json({ 
        message: 'success', 
        data: replies 
      });
    } catch (error) {
      next(error);
    }
  },
};

