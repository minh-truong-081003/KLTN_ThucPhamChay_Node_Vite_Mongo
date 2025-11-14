import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = {
  // Xác thực tùy chọn - lấy user nếu có token, nhưng không bắt buộc
  optionalAuth: async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
      token = req.headers?.authorization?.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
      } catch (err) {
        // Nếu token không hợp lệ, bỏ qua và tiếp tục
        req.user = null;
      }
    }
    next();
  },

  verifyToken: async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
      token = req.headers?.authorization?.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded?.id);
        req.user = user;
        console.log('✅ Token verified, user:', user?._id, user?.role);
        next();
      } catch (err) {
        console.error('❌ Token verification error:', err.name, err.message);
        if (err.name === 'JsonWebTokenError') {
          return res.status(200).json({
            message: 'Token không hợp lệ',
            err,
          });
        }
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            message: 'Token hết hạn',
            err,
          });
        }

        // throw new Error({
        //   message: 'Not authorized token expired, Please login again',
        //   err,
        // });
        return res.status(400).json({
          message: 'Token không hợp lệ',
        });
      }
    } else {
      console.error('❌ No token in request headers');
      // throw new Error({
      //   message: 'There is no token attached to header',
      // });
      return res.status(400).json({
        message: 'Không có token',
      });
    }
  },
  verifyTokenAdmin: async (req, res, next) => {
    authMiddleware.verifyToken(req, res, () => {
      if (req.user.role === 'admin') {
        next();
      } else {
        return res.status(403).json("You're not allowed to this task!!");
      }
    });
  },

  // Middleware cho Admin và Staff (nhân viên)
  verifyTokenAdminOrStaff: async (req, res, next) => {
    authMiddleware.verifyToken(req, res, () => {
      if (!req.user) {
        return res.status(401).json({
          message: 'fail',
          err: 'Người dùng không tồn tại'
        });
      }
      if (req.user.role === 'admin' || req.user.role === 'staff') {
        next();
      } else {
        return res.status(403).json({
          message: 'fail',
          err: 'Bạn không có quyền thực hiện thao tác này. Chỉ admin và staff mới được phép.'
        });
      }
    });
  },
};
// check admin co quyền đc sửa tk user
// export const isAdmin = async (req, res, next) => {
//   const { email } = req.user;
//   const adminUser = await User.findOne({ email });
//   if (adminUser.role !== "admin") {
//     throw new Error("You are not an admin")
//   } else {
//     next();
//   }
// }
