import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate dữ liệu
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Cấu hình transporter với App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test connection trước
    await transporter.verify();
    console.log('Email transporter verified successfully');

    // Nội dung email
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: 'vifood.contact@gmail.com', // Email nhận liên hệ
      subject: `Liên hệ từ website: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d3b673;">Thông tin liên hệ từ khách hàng</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Họ và tên:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
            <p><strong>Chủ đề:</strong> ${subject}</p>
            <p><strong>Nội dung:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #d3b673;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Email này được gửi từ trang liên hệ của VIFOOD
          </p>
        </div>
      `,
    };

    // Gửi email
    console.log('Sending contact email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);

    // Gửi email xác nhận cho khách hàng
    const confirmMailOptions = {
      from: `"VIFOOD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Cảm ơn bạn đã liên hệ với VIFOOD',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d3b673;">Cảm ơn bạn đã liên hệ!</h2>
          <p>Kính chào ${name},</p>
          <p>Chúng tôi đã nhận được thông tin liên hệ của bạn với chủ đề: <strong>${subject}</strong></p>
          <p>Đội ngũ VIFOOD sẽ phản hồi bạn trong thời gian sớm nhất, thường trong vòng 24 giờ.</p>
          <p>Nếu bạn có thêm thông tin gì, vui lòng reply email này.</p>
          <br>
          <p>Trân trọng,<br>Đội ngũ VIFOOD</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            VIFOOD - Siêu thị thực phẩm chay sạch<br>
            Email: contact@vifood.vn<br>
            Hotline: 1900.1111
          </p>
        </div>
      `,
    };

    console.log('Sending confirmation email...');
    const confirmInfo = await transporter.sendMail(confirmMailOptions);
    console.log('Confirmation email sent successfully:', confirmInfo.messageId);

    res.status(200).json({
      success: true,
      message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.'
    });

  } catch (error) {
    console.error('Lỗi gửi email liên hệ:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });

    // Trả về lỗi cụ thể hơn cho debugging
    let errorMessage = 'Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Lỗi xác thực email. Vui lòng kiểm tra cấu hình email.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Không thể kết nối đến máy chủ email.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Quá thời gian chờ gửi email.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};