import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { config as dotenvConfig }  from 'dotenv';

dotenvConfig();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeJsFunctionCommonSettings = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        RDS_HOST: process.env.RDS_HOST!,
        RDS_PORT: process.env.RDS_PORT!,
        RDS_USER: process.env.RDS_USER!,
        RDS_PASSWORD: process.env.RDS_PASSWORD!,
        RDS_DATABASE: process.env.RDS_DATABASE!
      },
      bundling: {
        externalModules: [
          'better-sqlite3',
          'mysql2',
          'mysql',
          'tedious',
          'sqlite3',
          'pg-query-stream',
          'oracledb',
        ],
      },
    }

    const getProductsList = new NodejsFunction(this, 'getProductsList', {
      ...nodeJsFunctionCommonSettings,
      entry: path.join(__dirname,'../lambda/getProductsList.ts'),
      functionName: 'getProductsList',
      handler: 'productsListHandler'
    });

    const getProductsById = new NodejsFunction(this, 'getProductsById', {
      ...nodeJsFunctionCommonSettings,
      entry: path.join(__dirname,'../lambda/getProductsById.ts'),
      functionName: 'getProductsById',
      handler: 'productsIdHandler'
    });

    const createProduct = new NodejsFunction(this, 'createProduct', {
      ...nodeJsFunctionCommonSettings,
      entry: path.join(__dirname,'../lambda/createProduct.ts'),
      functionName: 'createProduct',
      handler: 'createProductHandler'
    });

    const httpApi = new apiGateway.HttpApi(this, 'ProductsHttpApi', {
      apiName: 'Products Http Api',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY]
      }
    });

    const getProductsListIntegration = new HttpLambdaIntegration('productsIntegration', getProductsList);
    httpApi.addRoutes({
      path: '/products',
      methods: [apiGateway.HttpMethod.GET],
      integration: getProductsListIntegration,
    });
    new apiGateway.HttpStage(this, "DevStage", {
      httpApi,
      stageName: "dev",
      autoDeploy: true,
    });

    // httpApi.addRoutes({
    //   path: "/products",
    //   methods: [apiGateway.HttpMethod.GET],
    //   integration: getProductsListIntegration,
    // });

    const getProductsByIdIntegration = new HttpLambdaIntegration('productsByIdIntegration', getProductsById);
    httpApi.addRoutes(
      {
        path: '/products/{productId}',
        methods: [apiGateway.HttpMethod.GET],
        integration: getProductsByIdIntegration,
      }
    )

    const createProductIntegration = new HttpLambdaIntegration('createProductIntegration', createProduct);
    httpApi.addRoutes({
      path: '/products',
      methods: [apiGateway.HttpMethod.POST],
      integration: createProductIntegration,
    });
  }
}
