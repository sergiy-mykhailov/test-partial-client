/**
 * =======================================
 * ========= DEV WEBPACK CONFIG ==========
 * =======================================
 */

require('dotenv').config();
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

module.exports = merge(common, {
  devtool: 'inline-source-map',

  devServer: {
    contentBase: './dist',
    stats: 'minimal',
    historyApiFallback: true
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        BASE_SERVICE_URL: JSON.stringify(process.env.BASE_SERVICE_URL),
        MAPBOX_API_KEY: JSON.stringify(process.env.MAPBOX_API_KEY)
      }
    })
  ]
});
