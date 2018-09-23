/* eslint-env node */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './app/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/template.html',
    }),
    new CopyWebpackPlugin([
      {
        from: './app/static',
        to: 'static',
      },
    ]),
  ],
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    port: 1234,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              require('@babel/plugin-transform-runtime'),
              require('@babel/plugin-proposal-class-properties'),
              [require('@babel/plugin-proposal-decorators'), { legacy: true }],
              require('@babel/plugin-proposal-do-expressions'),
              require('@babel/plugin-proposal-export-default-from'),
              require('@babel/plugin-proposal-export-namespace-from'),
              require('@babel/plugin-proposal-function-bind'),
              require('@babel/plugin-proposal-function-sent'),
              require('@babel/plugin-proposal-json-strings'),
              require('@babel/plugin-proposal-logical-assignment-operators'),
              require('@babel/plugin-proposal-nullish-coalescing-operator'),
              require('@babel/plugin-proposal-numeric-separator'),
              require('@babel/plugin-proposal-object-rest-spread'),
              require('@babel/plugin-proposal-optional-chaining'),
              [require('@babel/plugin-proposal-pipeline-operator'), { 'proposal': 'minimal' }],
              require('@babel/plugin-proposal-throw-expressions'),
              require('@babel/plugin-syntax-dynamic-import'),
              require('@babel/plugin-syntax-import-meta'),
            ],
          },
        },
      },
    ],
  },
}
