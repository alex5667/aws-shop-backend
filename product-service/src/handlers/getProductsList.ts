import { getProductsList } from '../db/products';
import { buildResponse } from './utils';
import { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  console.log(`GET /products`);
  try {
    const availableProducts = await getProductsList();

    return buildResponse(200, availableProducts);
  } catch (error) {
    return buildResponse(500, error);
  }
};
