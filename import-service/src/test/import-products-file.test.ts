import { handler } from '../handlers/importProductsFile';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { Dir } from '../handlers/constants';

jest.mock('@aws-sdk/s3-request-presigner');

const s3ClientMock = mockClient(S3Client);
const getSignedUrlMock = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const urlMock = 'https://signed-url.mock';
const event = {
  queryStringParameters: {
    name: 'test.csv',
  },
} as unknown as APIGatewayProxyEvent;
const key = `${Dir.UPLOADED}/${
  (event.queryStringParameters && event.queryStringParameters) || ''
}`;

s3ClientMock
  .on(PutObjectCommand, { Bucket: 'test-bucket', Key: key }, true)
  .resolves({});
getSignedUrlMock.mockImplementation(() => Promise.resolve(urlMock));

describe('importProductsFile', () => {
  it('should return signed URL when file name is provided', async () => {
    const response = await handler(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(urlMock);
  });

  it('should return 400 status when file name is missing', async () => {
    const noFileNameEvent = {
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent;
    const response = await handler(noFileNameEvent);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual('Missing file name');
  });

  it('should return 500 status when an error occurs', async () => {
    const errorMsg = 'test';

    getSignedUrlMock.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMsg)),
    );

    const response = await handler(event);

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toEqual(errorMsg);
  });
});
