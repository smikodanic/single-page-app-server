# single-page-app-server
> A HTTP server for single page applications (angular, vue, react).

## Features
- no dependencies
- very fast
- simple to use
- define custom HTTP response headers (solve CORS)
- compress HTTP response (gzip or deflate)


## Example
```js
const SPAserver = require('../server');

const httpOpts = {
  port: 4520,
  timeout: 0, // if 0 never timeout
  staticDir: '/dist/angular-project',
  indexFile: 'index.html',
  acceptEncoding: 'deflate', // gzip, deflate or ''
  headers: {
    // CORS Headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET', // 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD',
    'Access-Control-Max-Age': '3600'
  },
  debug: false
};

const spaServer = new SPAserver(opts);
spaServer.start();
```


## API
- **start(): httpServer** - start the HTTP server
- **stop(): void** - stop the HTTP server
- **restart(): void** - restart the HTTP server



### Licence
Copyright (c) 2020 Saša Mikodanić licensed under [AGPL-3.0](./LICENSE) .
