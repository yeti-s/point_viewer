const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
      createProxyMiddleware('/file', {
          target: 'http://localhost:10001',
          changeOrigin: true
      })
  )
};