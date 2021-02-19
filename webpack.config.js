'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const pageList = [
    {
        name: 'index'
    },
    {
        name: 'triangle_interpolation',
        additionalChunks: ['triangleInterpolation']
    }
];

const pages = pageList.map((page) => {
    return new HtmlWebpackPlugin({
        filename: page.name + '.html',
        template: './source/pages/' + page.name + '.pug',
        chunks: ['main'].concat(page.additionalChunks)
    })
});

const config = {
    entry: {
        main: './source/code/main.ts',
        triangleInterpolation: './source/code/triangleInterpolation.ts'
    },
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /(source\/shaders|node_modules)/,
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name].css'
                        }
                    }
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                test: /\.(jpe?g|png|woff2?|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name]_[md5:hash:hex:4].[ext]'
                        }
                    }
                ]
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        library: undefined,
        libraryTarget: 'umd',
    },
    devServer: {
        open: true,
        contentBase: path.resolve(__dirname, "./source"),
        watchContentBase: true
    },
    plugins: [
        ...pages
    ]
};

module.exports = (env, argv) => {
    const devMode = argv.mode === 'development';
    config.output.publicPath = devMode ? '/' : '/svg-experiments/';
    config.plugins.push(
        new FaviconsWebpackPlugin({
            logo: './source/img/logo.svg',
            mode: devMode ? 'light' : 'webapp'
        })
    );
    return config;
}
