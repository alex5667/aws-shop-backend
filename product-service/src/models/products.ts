import * as Yup from 'yup';

export const ProductSchema = Yup.object({
  id: Yup.string(),
  title: Yup.string().required().defined(),
  description: Yup.string().required().defined(),
  price: Yup.number().positive().required().defined(),
});

export const AvailableProductSchema = ProductSchema.shape({
  count: Yup.number().integer().min(0).required().defined(),
});

export type Product = Yup.InferType<typeof ProductSchema>;
export type AvailableProduct = Yup.InferType<typeof AvailableProductSchema>;
export type CreateProductDTO = Omit<AvailableProduct, 'id'>;
