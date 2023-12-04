import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { productData, stockData } from './data';
import { Table } from '../utils/constants';

interface IDynamoDBItem {
  [key: string]: { S: string } | { N: string };
}

const dbClient = new DynamoDBClient({
  region: 'eu-west-1',
});

const seedTable = async <T extends Record<string, any>>(
  dbClient: DynamoDBClient,
  tableName: string,
  items: T[],
  keyField: keyof T & string
): Promise<void> => {
  try {
    await dbClient.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [tableName]: items.map((item) => {
            const dynamoDBItem: IDynamoDBItem = {
              [keyField]: { S: String(item[keyField]) },
            };

            Object.entries(item).forEach(([key, value]) => {
              if (key !== keyField) {
                dynamoDBItem[key] =
                  typeof value === 'number'
                    ? { N: String(value) }
                    : { S: String(value) };
              }
            });

            return {
              PutRequest: {
                Item: dynamoDBItem,
              },
            };
          }),
        },
      })
    );
    console.log(`Table seeded with data: ${tableName}`);
  } catch (error) {
    console.error(`Error seeding DynamoDB table ${tableName}`, error);
  }
};

(async () => {
  await seedTable(dbClient, Table.PRODUCTS, productData, 'id');
  await seedTable(dbClient, Table.STOCKS, stockData, 'product_id');
})();
