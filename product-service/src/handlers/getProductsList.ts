import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendResponse } from '../utils/helpers';
import { getProductsList } from '../lib/dbUtils';
import { ErrorMessages, StatusCodes } from '../utils/constants';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(`lambda: getProductsList, event: ${JSON.stringify(event)}`);

  try {
    const availableProducts = await getProductsList();
    return sendResponse(StatusCodes.OK, availableProducts);
  } catch (e) {
    return sendResponse(StatusCodes.INTERNAL_ERROR, {
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
