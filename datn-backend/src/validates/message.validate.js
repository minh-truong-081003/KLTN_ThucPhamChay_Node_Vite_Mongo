import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().required().messages({
    'string.empty': 'ID cuộc hội thoại không được để trống',
    'any.required': 'ID cuộc hội thoại là bắt buộc',
  }),
  text: Joi.string().required().min(1).max(5000).messages({
    'string.empty': 'Nội dung tin nhắn không được để trống',
    'string.min': 'Nội dung tin nhắn phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung tin nhắn không được vượt quá 5000 ký tự',
    'any.required': 'Nội dung tin nhắn là bắt buộc',
  }),
  attachments: Joi.array().items(Joi.string().uri()).optional().messages({
    'array.base': 'Attachments phải là một mảng',
    'string.uri': 'URL của attachment không hợp lệ',
  }),
});

export const updateConversationStatusSchema = Joi.object({
  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').optional().messages({
    'any.only': 'Trạng thái không hợp lệ. Chỉ chấp nhận: open, in-progress, resolved, closed',
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().messages({
    'any.only': 'Mức độ ưu tiên không hợp lệ. Chỉ chấp nhận: low, medium, high, urgent',
  }),
  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Tags phải là một mảng',
  }),
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật',
});

export const assignStaffSchema = Joi.object({
  staffId: Joi.string().required().messages({
    'string.empty': 'ID nhân viên không được để trống',
    'any.required': 'ID nhân viên là bắt buộc',
  }),
});

export const conversationQuerySchema = Joi.object({
  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20).optional(),
  search: Joi.string().optional(),
});
