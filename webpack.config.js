const path = require('path');

module.exports = {
  entry: './src/assets/js/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/assets/js'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'source-map',
};