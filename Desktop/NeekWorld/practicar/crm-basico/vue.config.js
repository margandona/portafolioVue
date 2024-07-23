// vue.config.js
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: '',
  filenameHashing: true,
  runtimeCompiler: false,
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  }
};
