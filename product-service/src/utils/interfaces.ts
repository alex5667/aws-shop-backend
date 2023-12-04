import { PutItemCommandOutput } from '@aws-sdk/client-dynamodb';

export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface IStock {
  product_id: string;
  count: number;
}

export interface IAvailableProduct extends IProduct {
  count: number;
}

export interface IProductInput extends Omit<IAvailableProduct, 'id'> {}

export interface IDBPutOutput<T>
  extends Omit<PutItemCommandOutput, 'Attributes'> {
  Attributes?: T;
}
