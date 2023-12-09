# Product service

## Deploy links

> BE Product service: <https://7uxztr6cn6.execute-api.eu-west-1.amazonaws.com/products>
>
> FE application: <https://d2tbewbqvvmzls.cloudfront.net>
>
> SWAGGER: <https://app.swaggerhub.com/apis/Alexander-M-rss/my-shop_backend/1.0.0>

Environment variables must be set in the `.env` file. You can see what variables are needed in `.env.example` file. In the root of the project you can find `create-product.postman_collection.json` file for createProduct request.

## Available Scripts

### `cdk:bootstrap`

Makes CDK bootstrap.

### `cdk:deploy`

Deploys lambda functions to AWS.

### `cdk:remove`

Removes Product service infrastructure from AWS.

### `test`

Runs unit tests.

### `lint`, `prettier`

Runs linting and formatting for all files in `src` folder.

## Available SQL Scripts

They are located in `scripts` folder. You can use them with database management application such as `DBeaver`.

### `create-tables.sql`

Creates tables.

### `seed-tables.sql`

Seeding tables with data.

### `clear-tables.sql`

Clears the contents of the tables.

### `delete-tables.sql`

Deletes the tables with it contents.
