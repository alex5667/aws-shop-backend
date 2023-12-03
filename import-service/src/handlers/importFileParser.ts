import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { S3Event } from 'aws-lambda';
import csv from 'csv-parser';
import { Dir } from './constants';


export const handler = async (event: S3Event): Promise<void> => {
  try {
    const records = event.Records;

    if (!records.length) {
      throw new Error('No event records have been found');
    }

    const client = new S3Client({
      region: process.env.IMPORT_AWS_REGION || '',
    });
    const BUCKET_NAME = process.env.BUCKET_NAME || '';

    for (const record of records) {
      const file = await client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: record.s3.object.key,
        }),
      );

      const data = file.Body;

      if (data instanceof Readable) {
        await new Promise((res) => {
          data
            .pipe(csv())
            .on('data', (data) => console.log(data))
            .on('end', async () => {
              console.log('File has been read');
              await client.send(
                new CopyObjectCommand({
                  Bucket: BUCKET_NAME,
                  CopySource: `${BUCKET_NAME}/${record.s3.object.key}`,
                  Key: record.s3.object.key.replace(Dir.UPLOADED, Dir.PARSED),
                }),
              );
              console.log(`File has been copied to /${Dir.PARSED}`);
              await client.send(
                new DeleteObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: record.s3.object.key,
                }),
              );
              console.log(`File has been deleted from /${Dir.UPLOADED}`);
              res(null);
            });
        });
      } else {
        console.error('File reading failure');
      }
    }
  } catch (error) {
    console.error(error);
  }
};
