const SPAserver = require('../server');

const opts = {
  port: 3500,
  timeout: 1000,
  staticDir: 'dist', // directory with static files (absolute path)
  indexFile: 'page.html' // root file in the staticDirAbsPath
};

const spaServer = new SPAserver(opts);
spaServer.start();
