import Joi from 'joi';

const ProductSchema = Joi.object({
  title: Joi.string().required().max(50),
  description: Joi.string().required().max(500),
  price: Joi.number().integer().positive().required(),
  count: Joi.number().integer().positive().required(),
});

export default ProductSchema;
