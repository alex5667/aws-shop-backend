import * as cdk from 'aws-cdk-lib';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import 'dotenv/config';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const API_PATH = 'products';
const API_ROUTE = `/${API_PATH}`;
const app = new cdk.App();
const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: {
    region: process.env.PRODUCT_AWS_REGION || 'eu-west-1',
  },
});
const catalogItemsQueue = new sqs.Queue(stack, 'CatalogItemsQueue', {
  queueName: 'catalog-items-queue',
});
const createProductTopic = new sns.Topic(stack, 'CreateProductTopic', {
  topicName: 'createProduct-topic',
});
const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PG_HOST: process.env.PG_HOST || '',
    PG_PORT: process.env.PG_PORT || '5432',
    PG_DB: process.env.PG_DB || '',
    PG_USER: process.env.PG_USER || '',
    PG_PASSWORD: process.env.PG_PASSWORD || '',
    TOPIC_ARN: createProductTopic.topicArn,
  },
  bundling: {
    externalModules: [
      'mysql',
      'mysql2',
      'better-sqlite3',
      'sqlite3',
      'tedious',
      'pg-query-stream',
      'better-sqlite3',
      'oracledb',
    ],
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
const catalogBatchProcess = new NodejsFunction(
  stack,
  'CatalogBatchProcessLambda',
  {
    ...sharedLambdaProps,
    functionName: 'catalogBatchProcess',
    entry: 'src/handlers/catalogBatchProcess.ts',
  },
);

catalogBatchProcess.addEventSource(
  new SqsEventSource(catalogItemsQueue, { batchSize: 5 }),
);
createProductTopic.grantPublish(catalogBatchProcess);
new sns.Subscription(stack, 'PrimarySubscription', {
  endpoint: process.env.PRIMARY_EMAIL || '',
  protocol: sns.SubscriptionProtocol.EMAIL,
  topic: createProductTopic,
});

if (process.env.LOW_STOCK_EMAIL) {
  new sns.Subscription(stack, 'NewLowStockSubscription', {
    endpoint: process.env.LOW_STOCK_EMAIL,
    protocol: sns.SubscriptionProtocol.EMAIL,
    topic: createProductTopic,
    filterPolicy: {
      count: sns.SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 10 }),
    },
  });
}

if (process.env.ERROR_EMAIL) {
  new sns.Subscription(stack, 'ErrorSubscription', {
    endpoint: process.env.ERROR_EMAIL,
    protocol: sns.SubscriptionProtocol.EMAIL,
    topic: createProductTopic,
    filterPolicy: {
      isContainsError: sns.SubscriptionFilter.stringFilter({
        allowlist: ['true'],
      }),
    },
  });
}

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    'GetProductsListIntegration',
    getProductsList,
  ),
  path: API_ROUTE,
  methods: [apiGateway.HttpMethod.GET],
});
api.addRoutes({
  integration: new HttpLambdaIntegration(
    'GetProductsByIdIntegration',
    getProductsById,
  ),
  path: `${API_ROUTE}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],
});
api.addRoutes({
  integration: new HttpLambdaIntegration(
    'CreateProductIntegration',
    createProduct,
  ),
  path: API_ROUTE,
  methods: [apiGateway.HttpMethod.POST],
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}${API_PATH}` ?? 'Something went wrong with the deployment.',
});

new cdk.CfnOutput(stack, 'CatalogItemsQueueArn', {
  value: catalogItemsQueue.queueArn,
});
