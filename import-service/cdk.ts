import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import 'dotenv/config';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { Dir } from './src/handlers/constants';
import * as sqs from 'aws-cdk-lib/aws-sqs';

const BUCKET_NAME = process.env.BUCKET_NAME || '';
const IMPORT_AWS_REGION = process.env.IMPORT_AWS_REGION || 'eu-west-1';
const QUEUE_ARN = process.env.QUEUE_ARN || '';
const API_PATH = 'import';
const app = new cdk.App();
const stack = new cdk.Stack(app, 'ImportServiceStack', {
  env: {
    region: IMPORT_AWS_REGION,
  },
});
const bucket = new s3.Bucket(stack, 'MyShopImportBucket', {
  bucketName: BUCKET_NAME,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  blockPublicAccess: new s3.BlockPublicAccess({
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  }),
  cors: [
    {
      allowedHeaders: ['*'],
      allowedOrigins: ['*'],
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
    },
  ],
});
const catalogItemsQueue = sqs.Queue.fromQueueArn(
  stack,
  'CatalogItemsQueue',
  QUEUE_ARN,
);
const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    IMPORT_AWS_REGION,
    BUCKET_NAME,
    QUEUE_URL: catalogItemsQueue.queueUrl,
  },
};
const importProductsFile = new NodejsFunction(
  stack,
  'ImportProductsFileLambda',
  {
    ...sharedLambdaProps,
    functionName: 'importProductsFile',
    entry: 'src/handlers/importProductsFile.ts',
  },
);
const importFileParser = new NodejsFunction(stack, 'ImportFileParserLambda', {
  ...sharedLambdaProps,
  functionName: 'importFileParser',
  entry: 'src/handlers/importFileParser.ts',
});

catalogItemsQueue.grantSendMessages(importFileParser);

const basicAuthorizer = lambda.Function.fromFunctionName(
  stack,
  'BasicAuthorizerLambda',
  process.env.AUTHORIZER_LAMBDA_NAME || '',
);
const authorizer = new apiGateway.TokenAuthorizer(
  stack,
  'ImportServiceAuthorizer',
  {
    handler: basicAuthorizer,
  },
);

new lambda.CfnPermission(stack, 'BasicAuthorizerInvoke Permissions', {
  action: 'lambda:InvokeFunction',
  functionName: basicAuthorizer.functionName,
  principal: 'apigateway.amazonaws.com',
  sourceArn: authorizer.authorizerArn,
});

const api = new apiGateway.RestApi(stack, 'ImportApi', {
  defaultCorsPreflightOptions: {
    allowHeaders: ['*'],
    allowOrigins: apiGateway.Cors.ALL_ORIGINS,
    allowMethods: apiGateway.Cors.ALL_METHODS,
  },
});

bucket.grantReadWrite(importProductsFile);

api.root
  .addResource(API_PATH)
  .addMethod('GET', new apiGateway.LambdaIntegration(importProductsFile), {
    requestParameters: { 'method.request.querystring.name': true },
    authorizer,
  });
api.addGatewayResponse('GatewayResponseUnauthorized', {
  type: apiGateway.ResponseType.UNAUTHORIZED,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'*'",
    'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE'",
    'Access-Control-Allow-Credentials': "'true'",
  },
});

bucket.grantReadWrite(importFileParser);
bucket.grantDelete(importFileParser);
bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(importFileParser),
  { prefix: Dir.UPLOADED },
);

new cdk.CfnOutput(stack, 'AuthorizerArn', {
  value: authorizer.authorizerArn,
});
