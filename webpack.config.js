var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

//提高loader的解析速度
var HappyPack = require('happypack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin;
var DefinePlugin = webpack.DefinePlugin;

var externals = {
    //import Vue(value) from 'vue'(key)
    'vue': 'Vue'
}

var entry = {
	"vendor": ["./js/common.js"]
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

//webpack配置
var webpackConfig = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js', 
        /* 较大的图片会生成到build/img下
         * 这样一来build/img和img会存在重复的图片
         * 为了减少体积
         * 通过publicPath将模块中的图片路径映射到根目录下的img文件夹
         * 直接删除build/img即可
         */
        publicPath: '../../'
    },
    externals: externals,
    devtool: 'source-map',
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
	            use: ['css-loader']
	        })
		}, {
			test: /\.scss$/,
	        use: ExtractTextPlugin.extract({
	            use: ['css-loader', 'sass-loader'],
	            fallback: 'style-loader'
	        })
		}, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 8192,
                name: 'img/[name].[ext]'
            }
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
			              	use: 'css-loader!sass-loader',
			              	fallback: 'vue-style-loader'
			            }),
			      		sass: ExtractTextPlugin.extract({
			              	use: 'css-loader!sass-loader?indentedSyntax',
			              	fallback: 'vue-style-loader'
			            }),
			    		css: ExtractTextPlugin.extract({
			              	use: 'css-loader',
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
        new OptimizeCSSPlugin()
    ]
};

module.exports = webpackConfig;