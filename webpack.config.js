var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var config = require('./config');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var vConsolePlugin = require('vconsole-webpack-plugin'); 

//提高loader的解析速度
var HappyPack = require('happypack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin;
var DefinePlugin = webpack.DefinePlugin;

var externals = {
    //import Vue(value) from 'vue'(key)
    'vue': 'Vue',
    'vue-router': 'VueRouter'
}

var entry = {
	"vendor": config.commonModule
}

var entryPath = path.resolve(__dirname, 'entry');

var files = fs.readdirSync(entryPath);
files.forEach(function(filename) {
    var stats = fs.statSync(path.join(entryPath, filename));
    if (stats.isFile() && path.extname(filename) == '.js') {
        var entryJSKey = filename.split('.js')[0];
        entry[entryJSKey] = path.join(entryPath, filename);
    }
})

var remLoader = `px2rem-loader?remUnit=${config.remUnit}`

// 删除build目录
var del = require('del');
del(['./build/*']);

//webpack配置
var webpackConfig = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js', 
        /* 较大的图片会生成到build/images下
         * 这样一来build/images和images会存在重复的图片
         * 为了减少体积
         * 通过publicPath将模块中的图片路径映射到根目录下的images文件夹
         * 直接删除build/images即可
         */
        publicPath: '../../'
    },
    externals: externals,
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['happypack/loader?id=babel']
        }, {
        	test: /\.vue$/,
        	exclude: /node_modules/,
        	use: ['happypack/loader?id=vue']
        }, {
    		test: /\.css$/,
	        use: ExtractTextPlugin.extract({
	            fallback: 'style-loader',
	            use: ['css-loader', remLoader]
	        })
		}, {
			test: /\.scss$/,
	        use: ExtractTextPlugin.extract({
	            use: ['css-loader', remLoader, 'sass-loader'],
	            fallback: 'style-loader'
	        })
		}, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 8192,
                name: 'images/[name].[ext]'
            }
        }, {
		test: /\.(ttf|eot|woff|woff2|svg)/,
		loader: 'file-loader'
	}]
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        alias: {
            '@': path.resolve(__dirname)
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        }),
        new HappyPack({
            id: 'babel',
            loaders: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'stage-2'],
                    plugins: ["transform-es2015-arrow-functions"]
                }
            }]
        }),
        new HappyPack({
        	id: 'vue',
        	loaders: [{
        		loader: 'vue-loader',
        		options: {
        			loaders: {
			      		scss: ExtractTextPlugin.extract({
			              	use: `css-loader!${remLoader}!sass-loader`,
			              	fallback: 'vue-style-loader'
			            }),
			      		sass: ExtractTextPlugin.extract({
			              	use: `css-loader!${remLoader}!sass-loader?indentedSyntax`,
			              	fallback: 'vue-style-loader'
			            }),
			    		css: ExtractTextPlugin.extract({
			              	use: `css-loader!${remLoader}`,
			              	fallback: 'vue-style-loader'
			            })
        			}
        		}
        	}]
        }),
        new CommonsChunkPlugin({
            name: ['vendor'],
            filename: 'vendor.js',
            minChunks: Infinity
        }),
        new NoEmitOnErrorsPlugin(),
        new UglifyJSPlugin({
        	test: /\.js(\?.*)?$/i,
        	sourceMap: true
        }),
        new ExtractTextPlugin('css/[name].css', {
            allChunks: false
        }),
        new OptimizeCSSPlugin(),
        new vConsolePlugin({
            filter: [],  // 需要过滤的入口文件
            enable: config.vconsole // 发布代码前记得改回 false
        }),
	new webpack.SourceMapDevToolPlugin()
    ]
};

/**
 * ### old devtool solution
 * 
 * config.isDevelopment && (webpackConfig.devtool = 'source-map');
 */

let sourceMapToolOptions = {}

config.devtoolService && (sourceMapToolOptions.filename = '[name].js.map')

config.isDevelopment && (webpackConfig.plugins = webpackConfig.plugins.concat([new webpack.SourceMapDevToolPlugin(sourceMapToolOptions)]))

module.exports = webpackConfig;
