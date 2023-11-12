import { Handler } from 'aws-lambda';
import { products } from '../mocks/data';
import { buildResponse } from './utils';

export const productsListHandler: Handler = async function(event) {
  console.log(event);
  try {
    return buildResponse(200, products);
  } catch(err) {
    return buildResponse(500, err);
  }
}