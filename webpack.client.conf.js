const merge = require('webpack-merge');
const base = require('./webpack.base.conf.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(base, {
   entry: {
       client: './src/entry-client.js'
   },
    plugins: [
       new VueSSRClientPlugin()
    ]
});