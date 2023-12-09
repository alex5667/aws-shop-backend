import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { createProduct } from '../db/products';
import { AvailableProductSchema, CreateProductDTO } from '../models/products';
import snsClient from '../libs/sns';
import { PublishCommand } from '@aws-sdk/client-sns';
import { CREATE_PRODUCT_NOTIFICATION_SUBJ } from './constants';

export const handler = async (event: SQSEvent): Promise<boolean> => {
  try {
    const productsList = event.Records.map(({ body }) => body);
    let createProductDTO: CreateProductDTO;

    for (const product of productsList) {
      try {
        createProductDTO = JSON.parse(product || '');
        createProductDTO = await AvailableProductSchema.validate(
          createProductDTO,
          {
            abortEarly: true,
          },
        );
        const id = await createProduct(createProductDTO);
        const publishCommand = new PublishCommand({
          Subject: CREATE_PRODUCT_NOTIFICATION_SUBJ.SUCCESS,
          Message: JSON.stringify({
            id,
            ...createProductDTO,
          }),
          TopicArn: process.env.TOPIC_ARN,
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: `${createProductDTO.count}`,
            },
          },
        });

        await snsClient.send(publishCommand);
      } catch (error) {
        const publishCommand = new PublishCommand({
          Subject: CREATE_PRODUCT_NOTIFICATION_SUBJ.ERROR,
          Message: JSON.stringify({
            productData: product,
            error: (error as Error).message || 'Invalid product data',
          }),
          TopicArn: process.env.TOPIC_ARN,
          MessageAttributes: {
            isContainsError: {
              DataType: 'String',
              StringValue: 'true',
            },
          },
        });

        await snsClient.send(publishCommand);
      }
    }
    return true;
  } catch {
    return false;
  }
};
