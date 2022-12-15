const path = require('path');
const NodeExternals = require('webpack-node-externals');
const glob = require('glob');

module.exports = {
  // entry: './src/server.ts',
  entry: {
    server: './src/server.ts',
    ...glob.sync('./src/cron/*.ts').reduce(function (obj, el) {
      obj[`crons/${path.parse(el).name}`] = el;
      return obj
    }, {})
  },
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /migrations/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  externals: [NodeExternals()],
};
