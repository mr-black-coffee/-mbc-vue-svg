const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'index.js',
        library: 'vue-svg',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/transform-runtime']
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    mode: "production",
    plugins: [
        // 请确保引入这个插件！
        new VueLoaderPlugin()
    ]
}