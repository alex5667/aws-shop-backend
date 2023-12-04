import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendResponse } from '../utils/helpers';
import { getProductById } from '../lib/dbUtils';
import { ErrorMessages, StatusCodes } from '../utils/constants';
import { IStock } from '../utils/interfaces';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`lambda: getProductsById, event: ${JSON.stringify(event)}`);

    const productId = event.pathParameters?.productId?.trim();
    if (!productId) {
      return sendResponse(StatusCodes.BAD_REQUEST, {
        message: ErrorMessages.PRODUCT_ID_NOT_DEFINED,
      });
    }

    const product = await getProductById(
      'id',
      productId,
      process.env.PRODUCTS_TABLE_NAME!
    );

    if (!product) {
      return sendResponse(StatusCodes.NOT_FOUND, {
        message: ErrorMessages.PRODUCT_NOT_FOUND,
      });
    }

    const stock = (await getProductById(
      'product_id',
      productId,
      process.env.STOCKS_TABLE_NAME!
    )) as IStock | null;

    const availableProduct = {
      ...product,
      count: stock?.count || 0,
    };
    return sendResponse(StatusCodes.OK, availableProduct);
  } catch (e) {
    return sendResponse(StatusCodes.INTERNAL_ERROR, {
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
