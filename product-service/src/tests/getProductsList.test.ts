import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { handler } from '../handlers/getProductsList';
import * as dbUtils from '../lib/dbUtils';
import { IAvailableProduct } from '../utils/interfaces';

const createMockEvent = (): APIGatewayProxyEvent => ({
  pathParameters: {},
  body: '',
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/products',
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayEventRequestContext,
  resource: 'mock-resource',
});

describe('getProductsList', () => {
  let getProductsListSpy: jest.SpyInstance;

  beforeEach(() => {
    getProductsListSpy = jest.spyOn(dbUtils, 'getProductsList');
  });

  afterEach(() => {
    getProductsListSpy.mockClear();
  });

  afterAll(() => {
    getProductsListSpy.mockRestore();
  });

  it('should return 200 and products with count when both products and stocks are found', async () => {
    const mockedProductItems: IAvailableProduct[] = [
      {
        id: '1',
        title: 'Product 1',
        description: 'Description 1',
        price: 10,
        count: 5,
      },
      {
        id: '2',
        title: 'Product 2',
        description: 'Description 2',
        price: 20,
        count: 10,
      },
    ];

    getProductsListSpy.mockResolvedValueOnce(mockedProductItems);

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(JSON.stringify(mockedProductItems));
    expect(getProductsListSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 200 and empty list when no products are found', async () => {
    getProductsListSpy.mockResolvedValueOnce([]);

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(JSON.stringify([]));
    expect(getProductsListSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 200 and products with count: 0 when no stocks are found', async () => {
    const mockedProductItems = [
      { id: '1', title: 'Product 1', description: 'Description 1', price: 10 },
      { id: '2', title: 'Product 2', description: 'Description 2', price: 20 },
    ];

    getProductsListSpy.mockResolvedValueOnce(
      mockedProductItems.map((product) => ({
        ...product,
        count: 0,
      }))
    );

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify(
        mockedProductItems.map((product) => ({
          ...product,
          count: 0,
        }))
      )
    );
    expect(getProductsListSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 500 error if an unexpected error occurs during query', async () => {
    getProductsListSpy.mockRejectedValueOnce(new Error('Unexpected error'));

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(
      JSON.stringify({
        message: 'Internal server error',
      })
    );
    expect(getProductsListSpy).toHaveBeenCalledTimes(1);
  });
});
