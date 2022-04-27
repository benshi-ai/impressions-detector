const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: process.env.NODE_ENV ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  entry: {
    lib: path.resolve(__dirname, './src/init.ts'),
  },
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: '[name].js',
    library: {
      name: '[name]',
      type: 'umd'
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
}
