const webpack = require("webpack")
const path = require('path')

let IS_PRODUCION = process.env.NODE_ENV === "production" ? true : false

console.log("PRODUCTION MODE IS " + IS_PRODUCION)

module.exports = {
  /* ビルドの起点となるファイルの設定 */
  entry: {
    "card": "./src/entrypoints/card.js",
    "history": "./src/entrypoints/history.js",
  },
  /* 出力されるファイルの設定 */
  output: {
    path: path.join(__dirname, '/renderer/js'), // 出力先のパス
    filename: `[name].js` // 出力先のファイル名
  },
  plugins: IS_PRODUCION ? [
      new webpack.optimize.UglifyJsPlugin({
          compress: {
              warnings: false,
              screw_ie8: true
          }
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
  ] : [],
  /* ソースマップをファイル内に出力させる */
  devtool: 'source-map',
  module: {
    /* loaderの設定 */
    loaders: [
	  {test:/\.vue$/, loader:'vue-loader'},
      {test:/\.js$/, loader:'babel-loader', exclude:/node_modules/},
    ]
  },
  target: "atom", /* http://qiita.com/aoki/items/35879e2acfc0afd5a604 */
  resolve: {
    alias: {
      /* https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only */
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  }
};
