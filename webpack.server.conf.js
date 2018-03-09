const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.conf.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(base, {
    target: 'node',
    entry: {
        server: './src/entry-server.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.template.html',
            filename: 'index.template.html',
            files: {
                js: "client.js"
            },
            excludeChunks: ['server']
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.VUE_ENV': '"server"'
        }),
        new VueSSRServerPlugin()
    ]
});