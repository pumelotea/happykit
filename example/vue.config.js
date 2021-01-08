module.exports = {
  lintOnSave: false,
  productionSourceMap: process.env.NODE_ENV === 'development',
  css: {
    extract: process.env.NODE_ENV !== 'development',
    // 是否构建样式地图，false 将提高构建速度
    sourceMap: false,
    loaderOptions: {
      scss: {
        // additionalData: `@import "~@/assets/variable.scss";`
      }
    }
  },
  devServer: {
    disableHostCheck: true
  },
  parallel: require('os').cpus().length > 1,
  configureWebpack: {
    //webpack的相关配置在这里
    plugins: []
  }
}
