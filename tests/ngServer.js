const SPAserver = require('../server');

const opts = {
  port: 3500,
  timeout: 1000,
  staticDir: 'dist', // directory with static files (absolute path)
  indexFile: 'page.html', // root file in the staticDirAbsPath
  acceptEncoding: 'gzip', // gzip, deflate or ''
  headers: {
    // CORS Headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD',
    'Access-Control-Max-Age': '3600'
  },
  debug: true
};

const spaServer = new SPAserver(opts);
spaServer.start();

