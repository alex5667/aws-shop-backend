import {
  DynamoDBClient,
  ScanCommand,
  TransactWriteItemsCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'node:crypto';
import {
  IAvailableProduct,
  IProduct,
  IProductInput,
  IStock,
} from '../utils/interfaces';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dbClient = new DynamoDBClient({
  region: 'eu-west-1',
});
const productsTableName = process.env.PRODUCTS_TABLE_NAME ?? '';
const stocksTableName = process.env.STOCKS_TABLE_NAME ?? '';

export const getProductsList = async (): Promise<IAvailableProduct[]> => {
  try {
    const { Items: productItems } = await dbClient.send(
      new ScanCommand({
        TableName: productsTableName,
      })
    );

    const { Items: stockItems } = await dbClient.send(
      new ScanCommand({
        TableName: stocksTableName,
      })
    );

    const products = (productItems ?? []).map((p) => unmarshall(p) as IProduct);
    const stocks = (stockItems ?? []).map((s) => unmarshall(s) as IStock);

    if (!products.length) {
      return [];
    }

    const availableProducts: IAvailableProduct[] = products.map((p) => {
      const stock = stocks.find((s) => s.product_id === p.id);
      return {
        ...p,
        count: stock?.count || 0,
      };
    });

    return availableProducts;
  } catch (e) {
    throw e;
  }
};

export const getProductById = async (
  key: string,
  value: string,
  TableName: string
) => {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: `${key} = :id`,
    ExpressionAttributeValues: { ':id': { S: value } },
  });
  const res = await dbClient.send(command);
  return res.Items?.[0] ? unmarshall(res.Items[0]) : null;
};

export const createProduct = async (
  product: IProductInput
): Promise<IAvailableProduct> => {
  const newProductId: string = randomUUID();

  await dbClient.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: productsTableName,
            Item: {
              id: { S: newProductId },
              title: { S: product.title },
              description: { S: product.description },
              price: { N: product.price.toString() },
            },
          },
        },
        {
          Put: {
            TableName: stocksTableName,
            Item: {
              product_id: { S: newProductId },
              count: { N: product.count.toString() },
            },
          },
        },
      ],
    })
  );

  return {
    id: newProductId,
    ...product,
  };
};
