
import express from 'express';
import { sendEmailOrder } from '../controllers/nodeMailer.controllers.js';
const MailerRouter = express.Router();
MailerRouter.get('/mailer', async()=>{
  const data = {
    to: "truong108nguyen@gmail.com",
    text: 'Hi!',
    subject: 'cảm ơn bạn đã đặt hàng tại ViFood',
    html: '',
  };
  await sendEmailOrder(data);
});
export default MailerRouter;