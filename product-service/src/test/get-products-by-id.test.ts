import { handler } from '../handlers/getProductsById';
import { availableProducts } from '../mocks/data';

describe('getProductsById', () => {
  const event = {
    headers: {},
    requestContext: {
      accountId: '963675272146',
      apiId: '7uxztr6cn6',
      domainName: '7uxztr6cn6.execute-api.eu-west-1.amazonaws.com',
      domainPrefix: '7uxztr6cn6',
      requestId: 'F_3j7hQ1DoEEPLw=',
      routeKey: 'GET /products/{productId}',
      stage: '$default',
      authorizer: null,
      protocol: 'HTTP',
      httpMethod: 'GET',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: '',
      requestTimeEpoch: 1585888946487,
      resourceId: '',
      resourcePath: '',
    },
    pathParameters: { productId: '' },
    isBase64Encoded: false,
    body: null,
    multiValueHeaders: {},
    httpMethod: '',
    path: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '',
  };

  it('returns 200 and product data if it is found by Id', async () => {
    const product = availableProducts[availableProducts.length - 1];

    event.pathParameters.productId = product.id as string;

    const result = await handler(event);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual(product);
  });

  it('returns 404 if product is not found by Id', async () => {
    event.pathParameters.productId = 'non-exist-product-Id';

    const result = await handler(event);

    expect(result.statusCode).toEqual(404);
  });

  it('returns 404 if product Id is empty', async () => {
    event.pathParameters.productId = '';

    const result = await handler(event);

    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual('"Product not found"');
  });
});
