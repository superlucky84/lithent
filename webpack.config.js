const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => ({
  target: 'web',
  entry: {
    wv: `./src/index.js`,
  },
  devtool: argv.mode === 'development' ? 'source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  output: {
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
    },
    publicPath: '/',
    filename: '[name].js',
    globalObject: 'this',
    path: path.resolve(
      __dirname,
      argv.mode === 'development' ? 'testdist' : 'dist'
    ),
    library: {
      name: '[name]',
      type: 'umd',
      export: 'default',
    },
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, './css'),
      publicPath: '/css',
    },
    client: {
      overlay: false,
    },
    port: 8080,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: './index.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      template: './result.html',
      filename: './result.html',
      minify: false,
    }),
    new StylelintPlugin({
      files: 'src/**/*.css',
    }),
    // new ESLintPlugin({
    // files: 'src/**/*.js',
    // }),
  ],
});
