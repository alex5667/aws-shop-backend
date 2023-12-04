import * as cdk from 'aws-cdk-lib';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';

const API_NAME = 'products';
const API_PATH = `/${API_NAME}`;

const app = new cdk.App();
const stack = new cdk.Stack(app, 'RssProductServiceStack', {
  env: { region: 'eu-west-1' },
});

const productsTable = TableV2.fromTableName(stack, 'ProductTable', 'products');
const stocksTable = TableV2.fromTableName(stack, 'StocksTable', 'stocks');

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: 'eu-west-1',
    PRODUCTS_TABLE_NAME: productsTable.tableName,
    STOCKS_TABLE_NAME: stocksTable.tableName,
  },
};

const getProductsList = new NodejsFunction(stack, 'GetProductsListLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsList',
  entry: 'src/handlers/getProductsList.ts',
});

const getProductsById = new NodejsFunction(stack, 'GetProductsByIdLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductsById',
  entry: 'src/handlers/getProductsById.ts',
});

const createProduct = new NodejsFunction(stack, 'CreateProductLambda', {
  ...sharedLambdaProps,
  functionName: 'createProduct',
  entry: 'src/handlers/createProduct.ts',
});

productsTable.grantReadData(getProductsList);
stocksTable.grantReadData(getProductsList);

productsTable.grantReadData(getProductsById);
stocksTable.grantReadData(getProductsById);

productsTable.grantWriteData(createProduct);
stocksTable.grantWriteData(createProduct);

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  },
});

api.addRoutes({
  path: API_PATH,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration(
    'GetProductsListLambdaIntegration',
    getProductsList
  ),
});

api.addRoutes({
  path: `${API_PATH}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],

  integration: new HttpLambdaIntegration(
    'GetProductsByIdIntegration',
    getProductsById
  ),
});

api.addRoutes({
  path: API_PATH,
  methods: [apiGateway.HttpMethod.POST],
  integration: new HttpLambdaIntegration(
    'CreateProductLambdaIntegration',
    createProduct
  ),
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}${API_NAME}`,
});
