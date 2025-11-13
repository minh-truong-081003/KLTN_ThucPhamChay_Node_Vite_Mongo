import joi from 'joi';

export const reviewValidate = joi.object({
  product: joi.string().required({
    'string.base': 'Product ID must be a string',
    'string.empty': 'Product ID is not allowed to be empty',
    'any.required': 'Product ID is required',
  }),
  order: joi.string().required({
    'string.base': 'Order ID must be a string',
    'string.empty': 'Order ID is not allowed to be empty',
    'any.required': 'Order ID is required',
  }),
  rating: joi
    .number()
    .integer()
    .min(1)
    .max(5)
    .required({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5',
      'any.required': 'Rating is required',
    }),
  comment: joi.string().allow('').optional(),
  images: joi
    .array()
    .items(
      joi.object({
        url: joi.string(),
        publicId: joi.string(),
        filename: joi.string(),
      })
    )
    .optional(),
});

export const updateReviewValidate = joi.object({
  rating: joi.number().integer().min(1).max(5).optional(),
  comment: joi.string().allow('').optional(),
  images: joi
    .array()
    .items(
      joi.object({
        url: joi.string(),
        publicId: joi.string(),
        filename: joi.string(),
      })
    )
    .optional(),
});

