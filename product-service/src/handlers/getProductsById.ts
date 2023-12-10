import { getProductsById } from '../db/products';
import { buildResponse } from './utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validate } from 'uuid';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.productId;

    console.log(`GET products/${id}`);

    if (!id || !validate(id)) {
      return buildResponse(404, 'Product not found');
    }

    const product = await getProductsById(id);

    if (!product) {
      return buildResponse(404, 'Product not found');
    }

    return buildResponse(200, product);
  } catch (error) {
    return buildResponse(500, error);
  }
};
