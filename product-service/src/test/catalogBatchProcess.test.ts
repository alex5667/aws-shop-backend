import { handler } from '../handlers/catalogBatchProcess';
import { availableProducts } from '../mocks/data';
import * as products from '../db/products';
import snsClient from '../libs/sns';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { CREATE_PRODUCT_NOTIFICATION_SUBJ } from '../handlers/constants';
import { PublishCommandInput } from '@aws-sdk/client-sns';

jest.mock('../libs/sns');
process.env.TOPIC_ARN = 'test::arn';

const snsClientMock = snsClient as jest.Mocked<typeof snsClient>;
const createProductMock = jest.spyOn(products, 'createProduct');
const product = availableProducts[availableProducts.length - 1];
const invalidProductData = { ...product, price: '2a3' };

describe('catalogBatchProcess', () => {
  beforeEach(() => {
    createProductMock.mockClear();
    snsClientMock.send.mockClear();
  });

  it('creates product and publishes success message', async () => {
    const eventMock: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(product),
        } as SQSRecord,
      ],
    };
    createProductMock.mockResolvedValueOnce(product.id);

    const isDataProceeded = await handler(eventMock);

    expect(createProductMock).toHaveBeenCalledWith(product);
    expect(snsClientMock.send).toHaveBeenCalled;

    const receivedInput = snsClientMock.send.mock.calls[0][0]
      .input as PublishCommandInput;

    expect(receivedInput.Subject).toEqual(
      CREATE_PRODUCT_NOTIFICATION_SUBJ.SUCCESS,
    );
    expect(receivedInput.TopicArn).toEqual(process.env.TOPIC_ARN);
    expect(isDataProceeded).toEqual(true);
  });

  it('proceeds invalid product data and publishes error message', async () => {
    const eventMock: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(invalidProductData),
        } as SQSRecord,
      ],
    };

    createProductMock.mockResolvedValueOnce(invalidProductData.id);

    const isDataProceeded = await handler(eventMock);

    expect(createProductMock).not.toHaveBeenCalledWith();
    expect(snsClientMock.send).toHaveBeenCalled;

    const receivedInput = snsClientMock.send.mock.calls[0][0]
      .input as PublishCommandInput;

    expect(receivedInput.Subject).toEqual(
      CREATE_PRODUCT_NOTIFICATION_SUBJ.ERROR,
    );
    expect(receivedInput.TopicArn).toEqual(process.env.TOPIC_ARN);
    expect(isDataProceeded).toEqual(true);
  });

  it('handles unexpected error', async () => {
    const eventMock: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(invalidProductData),
        } as SQSRecord,
      ],
    };

    createProductMock.mockResolvedValueOnce(() =>
      Promise.reject(new Error('unexpected error')),
    );

    let isDataProceeded = await handler(eventMock);

    expect(snsClientMock.send).toHaveBeenCalled;

    const receivedInput = snsClientMock.send.mock.calls[0][0]
      .input as PublishCommandInput;

    expect(receivedInput.Subject).toEqual(
      CREATE_PRODUCT_NOTIFICATION_SUBJ.ERROR,
    );
    expect(receivedInput.TopicArn).toEqual(process.env.TOPIC_ARN);
    expect(isDataProceeded).toEqual(true);

    createProductMock.mockResolvedValueOnce(product.id);
    snsClientMock.send.mockImplementation(() =>
      Promise.reject(new Error('unexpected error')),
    );

    isDataProceeded = await handler(eventMock);

    expect(isDataProceeded).toEqual(false);
  });
});
