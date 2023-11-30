import { Knex } from 'knex';
import * as path from 'path';
import * as fs from 'fs';

export async function seed(knex: Knex) {
  await knex('stocks').del();
  await knex('products').del();

  const productsPath = path.join(__dirname, '../../data/product_model.json');
  const stocksPath = path.join(__dirname, '../../data/stock_model.json');

  const productData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const stockData = JSON.parse(fs.readFileSync(stocksPath, 'utf8'));

  await knex('products').insert(productData);
  await knex('stocks').insert(stockData);
}
