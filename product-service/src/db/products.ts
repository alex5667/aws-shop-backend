import { CreateProductDTO } from '../models/products';
import pgClient from './index';

export const getProductsList = () =>
  pgClient('products')
    .join('stocks', 'products.id', 'stocks.product_id')
    .select('products.*', 'stocks.count');

export const getProductsById = (productId: string) =>
  pgClient('products')
    .join('stocks', 'products.id', 'stocks.product_id')
    .select('products.*', 'stocks.count')
    .where('products.id', productId)
    .first();

export const createProduct = async (productData: CreateProductDTO) => {
  const newProduct = {
    title: productData.title,
    description: productData.description,
    price: productData.price,
  };
  const newStock = {
    count: productData.count,
    product_id: '',
  };

  return pgClient.transaction(async (trx) => {
    const [{ id }] = await trx('products').insert(newProduct, 'id');

    newStock.product_id = id;
    await trx('stocks').insert(newStock);

    return id;
  });
};
