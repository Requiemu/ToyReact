module.exports = {
    entry: {
        main: './main.js'
    },
    mode: 'development',
    optimization: {
        minimize: false
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'createElement'}]]
                    }
                }
            }
        ]
    },
    devServer: {
        contentBase: './dist',
        port: 9123,
        open: true
      },
}