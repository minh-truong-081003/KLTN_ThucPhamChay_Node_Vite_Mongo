import express from 'express';
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getConversationsForAdmin,
  getConversationForCustomer,
  getConversationById,
  updateConversationStatus,
  assignStaffToConversation,
  getUnreadCount,
  deleteMessage,
  getOrCreateConversation,
} from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes cho cả admin và customer
router.post('/messages/send', authMiddleware.verifyToken, sendMessage);
router.get('/messages/conversation/:conversationId/messages', authMiddleware.verifyToken, getMessages);
router.put('/messages/conversation/:conversationId/mark-read', authMiddleware.verifyToken, markMessagesAsRead);
router.get('/messages/unread-count', authMiddleware.verifyToken, getUnreadCount);
router.delete('/messages/:messageId', authMiddleware.verifyToken, deleteMessage);

// Routes cho customer
router.get('/messages/conversation/my', authMiddleware.verifyToken, getConversationForCustomer);
router.get('/messages/conversation/init/:customerId', authMiddleware.verifyToken, getOrCreateConversation);

// Routes cho admin/staff only
router.get('/messages/conversations', authMiddleware.verifyTokenAdminOrStaff, getConversationsForAdmin);
router.get('/messages/conversation/:conversationId', authMiddleware.verifyTokenAdminOrStaff, getConversationById);
router.put(
  '/messages/conversation/:conversationId/status',
  authMiddleware.verifyTokenAdminOrStaff,
  updateConversationStatus
);
router.put(
  '/messages/conversation/:conversationId/assign',
  authMiddleware.verifyTokenAdminOrStaff,
  assignStaffToConversation
);

export default router;
