import joi from 'joi';

export const voucherValidate = joi.object({
  title: joi.string().required().messages({
    'any.required': 'Tiêu đề voucher là bắt buộc',
    'string.empty': 'Không được để trống',
    'string.unique': 'Tên tiêu đề đã tồn tại',
  }),
  desc: joi.string().required().messages({
    'any.required': 'Mô tả voucher là bắt buộc',
    'string.empty': 'Mô tả voucher không được để trống',
  }),
  // code: optional - if not provided it will be generated from `title` on the server
  code: joi.string()
    .length(15)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{15}$/)
    .optional()
    .messages({
      'string.length': 'Mã voucher phải chính xác 15 ký tự',
      'string.pattern.base': 'Mã voucher phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số',
    }),
  discount: joi.number().required(),
  sale: joi.number().required(),
  startDate: joi.date().default(Date.now),
  endDate: joi.date().default(Date.now + 1),
  isActive: joi.boolean().default(true).messages({
    'any.required': 'isActive is required',
  }),
});
