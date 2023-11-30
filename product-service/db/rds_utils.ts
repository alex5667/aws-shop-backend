import { IProduct, IStock } from './types';
import Knex from 'knex';
import knexConfig from './knexfile';

const knex = Knex(knexConfig);

const getProducts = async () => {
  const products = await knex('products')
    .select('products.id', 'products.description', 'products.price', 'products.title', 'stocks.count')
    .innerJoin('stocks', 'products.id', 'stocks.product_id');

  return products;
};

const getProductById = async (id: string) => {
  const product = await knex('products')
    .select('products.id', 'products.description', 'products.price', 'products.title', 'stocks.count')
    .innerJoin('stocks', 'products.id', 'stocks.product_id')
    .where('products.id', id)
    .first();

  return product;
};

const createProductTransaction = async (product: IProduct, stock: IStock) => {
  try {
    await knex.transaction(async (trx) => {
      await trx('products').insert(product);
      await trx('stocks').insert(stock);
    });
  } catch (err) {
    console.error('Error creating product in transaction:', err);
    throw err;
  }
};


export { getProducts, getProductById, createProductTransaction }