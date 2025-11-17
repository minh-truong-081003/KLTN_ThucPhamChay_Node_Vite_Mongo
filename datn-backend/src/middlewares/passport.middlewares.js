import passportOauth from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
const GoogleStrategy = passportOauth.Strategy;
dotenv.config();

const passportMiddleware = {
  GoogleAuth: new GoogleStrategy(
    {
      clientID: process.env.GOOGLEID,
      clientSecret: process.env.SECRETGOOGLEID,
      callbackURL: process.env.CALLBACKURLGOOGLE,
    },
    function (accessToken, refreshToken, profile, cb) {
      (async () => {
        try {
          const user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if account already exists from email registration
            const existingUser = await User.findOne({ account: profile.emails[0].value });
            if (existingUser && !existingUser.googleId) {
              return cb(null, false, { message: 'Tài khoản đã đăng ký bằng email.' });
            }

            const newUser = await User.create({
              googleId: profile.id,
              username: profile.name.givenName,
              avatar: profile.photos[0].value,
              account: profile.emails[0].value,
              role: 'customer',
              gender: 'male',
              isVerified: true, // Google login is verified
            });
            return cb(null, newUser);
          }
          return cb(null, user);
        } catch (error) {
          return cb(error, null);
        }
      })();
    }
  ),
};

export default passportMiddleware;
