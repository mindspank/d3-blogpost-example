const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: 'dist'
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.ejs' })
    ]
}