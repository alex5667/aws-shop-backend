import { createProduct } from '../db/products';
import { AvailableProductSchema, CreateProductDTO } from '../models/products';
import { buildResponse } from './utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  let createProductDTO: CreateProductDTO;

  console.log(`POST /products\n${event.body}`);
  try {
    createProductDTO = JSON.parse(event.body || '');
  } catch {
    return buildResponse(400, 'Incorrect product data');
  }
  try {
    createProductDTO = await AvailableProductSchema.validate(createProductDTO, {
      abortEarly: true,
    });
  } catch (error) {
    return buildResponse(400, error);
  }
  try {
    const id = await createProduct(createProductDTO);

    return buildResponse(201, { id, ...createProductDTO });
  } catch (error) {
    return buildResponse(500, error);
  }
};
