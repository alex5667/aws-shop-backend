import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { handler } from '../handlers/getProductsById';
import * as dbUtils from '../lib/dbUtils';

const createMockEvent = (
  productId: string | undefined
): APIGatewayProxyEvent => ({
  pathParameters: {
    productId: productId,
  },
  body: '',
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: `/products/${productId}`,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayEventRequestContext,
  resource: 'mock-resource',
});

describe('getProductsById', () => {
  let queryItemSpy: jest.SpyInstance;

  beforeEach(() => {
    queryItemSpy = jest.spyOn(dbUtils, 'getProductById');
  });

  afterEach(() => {
    queryItemSpy.mockClear();
  });

  afterAll(() => {
    queryItemSpy.mockRestore();
  });

  it('should return 200 and product details when a valid product ID is provided', async () => {
    const testId = '1';
    const mockedProduct = {
      id: testId,
      title: 'Test product',
      description: 'Test description',
      price: 55,
    };

    const mockedStock = {
      product_id: testId,
      count: 5,
    };

    queryItemSpy.mockResolvedValueOnce(mockedProduct);
    queryItemSpy.mockResolvedValueOnce(mockedStock);

    const mockEvent: APIGatewayProxyEvent = createMockEvent(testId);

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({ ...mockedProduct, count: mockedStock.count })
    );
    expect(queryItemSpy).toHaveBeenCalledTimes(2);
  });

  it('should return 404 error if product details are not found', async () => {
    queryItemSpy.mockResolvedValueOnce(null);

    const mockEvent: APIGatewayProxyEvent = createMockEvent(
      'nonexistent-product-id'
    );

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(
      JSON.stringify({
        message: 'Product not found',
      })
    );
    expect(queryItemSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 500 error if an unexpected error occurs during query', async () => {
    queryItemSpy.mockRejectedValueOnce(new Error('Unexpected error'));

    const mockEvent: APIGatewayProxyEvent = createMockEvent('valid-product-id');

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(
      JSON.stringify({
        message: 'Internal server error',
      })
    );
    expect(queryItemSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 400 error if product ID is not defined', async () => {
    const mockEvent: APIGatewayProxyEvent = createMockEvent(undefined);

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        message: 'Product id is not defined',
      })
    );
    expect(queryItemSpy).not.toHaveBeenCalled();
  });
});
