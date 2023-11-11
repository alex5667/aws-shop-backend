import { Handler } from 'aws-lambda';
import { products } from '../mocks/data';
import { buildResponse } from './utils';

export const productsIdHandler: Handler = async function(event) {
  try {
    const product = products.find((el) => el.id === event.pathParameters?.productId);

    if (!product) {
      return  buildResponse(404, 'Product not found');
    }

    return buildResponse(200, product);
  } catch(err) {
    return buildResponse(500, err);
  }
}
