const webpack = require("webpack");
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const PATHS = {
	src: path.join(__dirname, "src"),
	dist: path.join(__dirname, "dist"),
	assets: "assets/"
};


const postcssPresetEnv = require('postcss-preset-env');

const devMode = process.env.NODE_ENV !== "production";

const htmlPageNames = ['prikol'];
const multipleHtmlPlugins = htmlPageNames.map(name => {
  return new HtmlWebpackPlugin({
	template: `${PATHS.src}/html/${name}.html`,
	filename: `${name}.html`,
	chunks: [`${name}`],
	})
});



const plugins = [
	new CleanWebpackPlugin(),
	new MiniCssExtractPlugin({
		filename: "[name].css",
		chunkFilename: "[id].css",
	}),
	new HtmlWebpackPlugin({
		template: `${PATHS.src}/html/index.html`,
		filename: './index.html',
		favicon: `${PATHS.src}/assets/images/logo.svg`,
	})
].concat(multipleHtmlPlugins);

if (devMode) {
	plugins.push(new webpack.HotModuleReplacementPlugin());
};

module.exports = {
	mode: 'development',
	entry: {
		index: {
			import: './src/index.js',
			dependOn: 'shared',
		},
		shared: 'lodash',
	},
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
	},
	plugins,
	output: {
		filename: '[name].[contenthash].js',
		path: PATHS.dist,
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserWebpackPlugin(),
			new CssMinimizerPlugin(),
		],
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
				styles: {
					name: "styles",
					type: "css/mini-extract",
					chunks: "all",
					enforce: true,
				},
			},
		},
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: 'html-loader'
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					"sass-loader",
				],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
};