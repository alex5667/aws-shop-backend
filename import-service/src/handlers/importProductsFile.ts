import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { buildResponse } from './utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Dir } from './constants';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return buildResponse(400, 'Missing file name');
  }

  const client = new S3Client({ region: process.env.IMPORT_AWS_REGION });
  const BUCKET_NAME = process.env.BUCKET_NAME || 'test-bucket';
  const putObjCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${Dir.UPLOADED}/${fileName}`,
    ContentType: 'text/csv',
  });

  try {
    const url = await getSignedUrl(client, putObjCommand);
    return buildResponse(200, url);
  } catch (error) {
    const errorMsg =
      (error instanceof Error && error.message) || 'Unknown error';

    return buildResponse(500, errorMsg);
  }
};
