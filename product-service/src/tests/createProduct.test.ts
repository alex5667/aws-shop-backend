import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { handler } from '../handlers/createProduct';
import * as dbUtils from '../lib/dbUtils';
import { StatusCodes } from '../utils/constants';

const createMockEvent = (body: unknown): APIGatewayProxyEvent => ({
  pathParameters: null,
  body: JSON.stringify(body),
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/products',
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayEventRequestContext,
  resource: 'mock-resource',
});

describe('createProduct', () => {
  let createProductSpy: jest.SpyInstance;

  beforeEach(() => {
    createProductSpy = jest.spyOn(dbUtils, 'createProduct');
  });

  afterEach(() => {
    createProductSpy.mockClear();
  });

  afterAll(() => {
    createProductSpy.mockRestore();
  });

  it('should create a product with a valid body', async () => {
    const mockProduct = {
      id: 'mockProductId',
      title: 'Mock title',
      description: 'Mock description',
      price: 10,
      count: 1,
    };

    createProductSpy.mockResolvedValueOnce(mockProduct);

    const mockEvent = createMockEvent({
      description: 'Mock description',
      price: 10,
      title: 'Mock title',
      count: 1,
    });

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(createProductSpy).toHaveBeenCalled();

    const responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual(mockProduct);
  });

  it('should return 400 error with an invalid body', async () => {
    const mockEvent = createMockEvent({
      description: 'Mock description 2',
    });

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(createProductSpy).not.toHaveBeenCalled();
  });

  it('should return 500 error if an unexpected error occurs during product creation', async () => {
    createProductSpy.mockRejectedValueOnce(new Error('Unexpected error'));

    const mockEvent = createMockEvent({
      description: 'Mock description',
      price: 1,
      title: 'Mock title',
      count: 1,
    });

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.INTERNAL_ERROR);
    expect(createProductSpy).toHaveBeenCalled();
  });
});
