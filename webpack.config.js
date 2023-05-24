const path = require('path');

module.exports = {
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js",
    publicPath: "/dashboard/",
  },
  devServer: {
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve('src'),
    }
  },
};
