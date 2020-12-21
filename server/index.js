const http = require('http');
const fs = require('fs');
const path = require('path');


/**
 * Internal HTTP Server which will run in case that external is not injected.
 * - port:number - HTTP Serer port number
 * - timeout:number - ms of inactivity after ws will be closed. If 0 then the ws will never close. Default is 5 minutes.
 */
class SPAServer {

  constructor(opts) {

    // HTTP server options
    if (!!opts) {
      this.opts = opts;
      if (!this.opts.port) { throw new Error('The server port is not defined.'); }
      else if (this.opts.timeout === undefined) { this.opts.timeout = 5*60*1000; }
      else if (!this.opts.staticDir) { throw new Error('Parameter "staticDir" is not defined.'); }
    } else {
      throw new Error('HTTP options are not defined.');
    }

    this.httpServer;
  }



  /*** HTTP SERVER COMMANDS ***/
  /**
   * Start the HTTP Server
   * @returns {Server} - nodeJS HTTP server instance https://nodejs.org/api/http.html#http_class_http_server
   */
  start() {
    // start HTTP Server
    this.httpServer = http.createServer((req, res) => {

      // requested file path
      let reqFile;
      if (req.url === '/') { // root request
        reqFile = this.opts.indexFile || 'index.html';
      } else { // if there's file extension for example /some.js or /some/thing.css
        reqFile = req.url;
      }


      // define Content-Type header and encoding according to file extension
      const mime = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        js: 'application/javascript'
      };
      let contentType = mime.html;
      let encoding = 'utf8';
      const matched = reqFile.match(/\.(.+)$/i);
      const fileExt = matched[1]; // html, txt, css, js, png, ...
      if (/html|htm/.test(fileExt)) { contentType = mime.html; encoding = 'utf8'; }
      else if (/txt/.test(fileExt)) { contentType = mime.txt; encoding = 'utf8';  }
      else if (/css/.test(fileExt)) { contentType = mime.css; encoding = 'utf8';  }
      else if (/gif/.test(fileExt)) { contentType = mime.gif; encoding = 'binary';  }
      else if (/jpg|jpeg/.test(fileExt)) { contentType = mime.jpg; encoding = 'binary';  }
      else if (/svg/.test(fileExt)) { contentType = mime.svg; encoding = 'binary';  }
      else if (/js/.test(fileExt)) { contentType = mime.js; encoding = 'utf8';  }


      const filePath = path.join(process.cwd(), this.opts.staticDir, reqFile);

      console.log('\n\nreq.url:: ', req.url);
      console.log('reqFile:: ', reqFile);
      console.log('fileExt:: ', fileExt, ' contentType:: ', contentType, ' encoding:: ', encoding);
      console.log('filePath:: ', filePath);

      if (fs.existsSync(filePath)) {
        try {
          res.writeHead(200, {'Content-Type': contentType });
          fs.createReadStream(filePath).pipe(res);
          // const content = fs.readFileSync(filePath, 'utf8');
          // res.end(content, encoding);
        } catch (err) {
          console.log(err);
        }
      } else {
        res.writeHead(404);
        const errMsg = `NOT FOUND: "${filePath}"`;
        console.log(errMsg);
        res.end(errMsg);
      }

    });

    // configure HTTP Server
    this.httpServer.listen(this.opts.port);
    this.httpServer.timeout = this.opts.timeout;

    // listen for server events
    this.events();

    return this.httpServer;
  }


  /**
   * Stop the HTTP Server
   */
  async stop() {
    await new Promise(resolve => setTimeout(resolve, 2100));
    this.httpServer.close();
  }


  /**
   * Restart the HTTP Server
   */
  async restart() {
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 2100));
    this.start();
  }




  /*** HTTP SERVER EVENTS ***/
  events() {
    this._onListening();
    this._onClose();
    this._onError();
  }


  _onListening() {
    this.httpServer.on('listening', () => {
      const addr = this.httpServer.address();
      const ip = addr.address === '::' ? '127.0.0.1' : addr.address;
      const port = addr.port;
      console.log(`HTTP Server is started on ${ip}:${port}`);
    });
  }


  _onClose() {
    this.httpServer.on('close', () => {
      console.log(`HTTP Server is stopped.`);
    });
  }


  _onError() {

    this.httpServer.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = (typeof this.opts.port === 'string')
        ? 'Pipe ' + this.opts.port
        : 'Port ' + this.opts.port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        console.error(error);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
      }
    });

  }

}



module.exports = SPAServer;
