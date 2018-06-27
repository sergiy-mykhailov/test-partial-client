
const corsProxy = require('cors-anywhere');
const config = require('./proxy.config');

const HOST = config.host || '0.0.0.0';
const PORT = config.port || 8888;

corsProxy.createServer({
  originWhitelist: [], // Allow all origins
  removeHeaders: ['cookie', 'cookie2']
}).listen(PORT, HOST, function() {
  console.log(`CORS-proxy started on port ${PORT}`);
});
