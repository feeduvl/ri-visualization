module.exports = {
  publicPath: '/dashboard/',
  productionSourceMap: false,
  devServer: {
    proxy: 'https://feed-uvl.ifi.uni-heidelberg.de',
    disableHostCheck: true,
  }

};
