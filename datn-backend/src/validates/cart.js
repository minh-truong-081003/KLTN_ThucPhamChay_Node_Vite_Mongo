import joi from 'joi';

export const cartValidate = joi.object({

  name: joi.string().required(),
  items: joi.array().items(
    joi.object({
      image: joi.string().required(),
      product: joi.string().required(),
      quantity: joi.number().required(),
      price: joi.number().required(),
      size: joi.string(),
      total: joi.number().required()
    })
  ),
});
