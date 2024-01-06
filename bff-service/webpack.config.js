/* eslint-disable @typescript-eslint/no-var-requires */
// const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    entry: './src/main.ts',
    externals: [
      '@grpc/grpc-js',
      '@grpc/proto-loader',
      'amqp-connection-manager',
      'amqplib',
      'mqtt',
      'nats',
      'mysql',
      'mysql2',
      'pg-query-stream',
      'better-sqlite3',
      'sqlite3',
      'tedious',
      'better-sqlite3',
      'oracledb',
    ],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
  };
};
