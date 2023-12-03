import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import 'dotenv/config';
import { Dir } from './src/handlers/constants';

const BUCKET_NAME = process.env.BUCKET_NAME || '';
const IMPORT_AWS_REGION = process.env.IMPORT_AWS_REGION || 'eu-west-1';
const API_PATH = 'import';
const app = new cdk.App();
const stack = new cdk.Stack(app, 'ImportServiceStack', {
  env: {
    region: IMPORT_AWS_REGION,
  },
});

const lambdaRole = new iam.Role(stack, 'LambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
});
lambdaRole.addManagedPolicy(
  iam.ManagedPolicy.fromAwsManagedPolicyName(
    'service-role/AWSLambdaBasicExecutionRole',
  ),
);

const bucket = new s3.Bucket(stack, 'MyShopImportBucket', {
  bucketName: BUCKET_NAME,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  cors: [
    {
      allowedHeaders: ['*'],
      allowedOrigins: ['*'],
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
    },
  ],
});

const lambdaCommonProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    IMPORT_AWS_REGION,
    BUCKET_NAME,
  },
  role: lambdaRole,
};

const importProductsFile = new NodejsFunction(
  stack,
  'ImportProductsFileLambda',
  {
    ...lambdaCommonProps,
    functionName: 'importProductsFile',
    entry: 'src/handlers/importProductsFile.ts',
  },
);

const importFileParser = new NodejsFunction(stack, 'ImportFileParserLambda', {
  ...lambdaCommonProps,
  functionName: 'importFileParser',
  entry: 'src/handlers/importFileParser.ts',
});

const api = new apiGateway.RestApi(stack, 'ImportApi', {
  defaultCorsPreflightOptions: {
    allowHeaders: ['*'],
    allowOrigins: apiGateway.Cors.ALL_ORIGINS,
    allowMethods: apiGateway.Cors.ALL_METHODS,
  },
});

bucket.grantReadWrite(lambdaRole);

api.root
  .addResource(API_PATH)
  .addMethod('GET', new apiGateway.LambdaIntegration(importProductsFile), {
    requestParameters: { 'method.request.querystring.name': true },
  });

bucket.grantReadWrite(importProductsFile);
bucket.grantReadWrite(importFileParser);
bucket.grantDelete(importFileParser);

bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3notifications.LambdaDestination(importFileParser),
  { prefix: Dir.UPLOADED },
);
