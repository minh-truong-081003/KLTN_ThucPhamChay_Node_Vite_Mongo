import express from 'express';
import { sendContactEmail } from '../controllers/contact.controllers.js';

const contactRouter = express.Router();

// Route gửi liên hệ
contactRouter.post('/contact', sendContactEmail);

export default contactRouter;