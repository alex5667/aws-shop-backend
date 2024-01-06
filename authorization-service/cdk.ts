import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dotenv from 'dotenv';

const lambdaEnvironment: dotenv.DotenvPopulateInput = {};

dotenv.config({ processEnv: lambdaEnvironment });

const app = new cdk.App();
const stack = new cdk.Stack(app, 'AuthorizationServiceStack', {
  env: {
    region: lambdaEnvironment.AUTHORIZATION_AWS_REGION || 'eu-west-1',
  },
});
const basicAuthorizer = new NodejsFunction(stack, 'BasicAuthorizerLambda', {
  runtime: lambda.Runtime.NODEJS_18_X,
  functionName: 'basicAuthorizer',
  entry: 'src/handlers/basicAuthorizer.ts',
  environment: lambdaEnvironment,
});
new cdk.CfnOutput(stack, 'BasicAuthorizerLambdaArn', {
  value: basicAuthorizer.functionArn,
});
