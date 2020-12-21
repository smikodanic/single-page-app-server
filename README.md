# single-page-app-server
> A HTTP server for single page applications (angular, vue, react).

## Features
- no dependencies
- very fast
- simple to use


## Example
```js
const SPAserver = require('../server');

const opts = {
  port: 3500,
  timeout: 1000,
  staticDir: 'dist', // directory with static files (absolute path)
  indexFile: 'page.html', // root file in the staticDirAbsPath
  acceptEncoding: 'gzip', // gzip, deflate or ''
  debug: true // show debug message in the terminal (useful for developers)
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
