const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');


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
      else if (!this.opts.headers) { this.opts.headers = []; }
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

      const urlNoQuery = req.url.replace(/\?.+/, ''); // uRL where query is removed, for example for example ?v=4.7.0

      // define Content-Type header and encoding according to file extension
      const mime = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        ico: 'image/x-icon',
        svg: 'image/svg+xml',
        js: 'application/javascript',
        mp4: 'video/mp4',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        js_map: 'application/json',
        css_map: 'application/octet-stream',
      };
      let contentType = mime.html;
      let encoding = 'utf8';
      const matched = urlNoQuery.match(/\.([^.]+)$/i);
      const matched2 = urlNoQuery.match(/\.([^.]+)\.[^.]+$/i);
      // const matched = urlNoQuery.match(/\.(.+)$/i);
      const fileExt = !!matched ? matched[1] : ''; // html, txt, css, js, png, ...
      const fileExt2 = !!matched2 ? matched2[1] : ''; // on js.map or css.map
      if (/^html$/.test(fileExt)) { contentType = mime.html; encoding = 'utf8'; }
      else if (/^htm$/.test(fileExt)) { contentType = mime.html; encoding = 'utf8'; }
      else if (/^txt$/.test(fileExt)) { contentType = mime.txt; encoding = 'utf8';  }
      else if (/^css$/.test(fileExt)) { contentType = mime.css; encoding = 'utf8';  }
      else if (/^gif$/.test(fileExt)) { contentType = mime.gif; encoding = 'binary';  }
      else if (/^jpg$/.test(fileExt)) { contentType = mime.jpg; encoding = 'binary';  }
      else if (/^jpeg$/.test(fileExt)) { contentType = mime.jpg; encoding = 'binary';  }
      else if (/^svg$/.test(fileExt)) { contentType = mime.svg; encoding = 'binary';  }
      else if (/^png$/.test(fileExt)) { contentType = mime.png; encoding = 'binary';  }
      else if (/^ico$/.test(fileExt)) { contentType = mime.ico; encoding = 'binary';  }
      else if (/^js$/.test(fileExt)) { contentType = mime.js; encoding = 'utf8';  }
      else if (/^mp4$/.test(fileExt)) { contentType = mime.mp4; encoding = 'binary';  }
      else if (/^woff$/.test(fileExt)) { contentType = mime.woff; encoding = 'binary';  }
      else if (/^woff2$/.test(fileExt)) { contentType = mime.woff2; encoding = 'binary';  }
      else if (/^ttf$/.test(fileExt)) { contentType = mime.ttf; encoding = 'binary';  }
      else if (/^map$/.test(fileExt) && /^css$/.test(fileExt2)) { contentType = mime.js_map; encoding = 'utf8';  }
      else if (/^map$/.test(fileExt) && /^js$/.test(fileExt2)) { contentType = mime.css_map; encoding = 'utf8';  }


      // requested file path
      let reqFile;
      if (!fileExt) { // if request doesn't contain file extension, for example / or /some/thing/
        reqFile = this.opts.indexFile || 'index.html';
      } else { // if there's file extension for example /some.js or /some/thing.css
        reqFile = urlNoQuery;
      }

      const filePathOrig = path.join(process.cwd(), this.opts.staticDir, reqFile);
      const filePath = filePathOrig.replace(/\?.+/, ''); // remove URL query for example ?v=4.7.0

      if (this.opts.debug) {
        console.log('\n\nreq.url:: ', req.url);
        console.log('urlNoQuery:: ', urlNoQuery);
        console.log('reqFile:: ', reqFile);
        console.log('fileExt::', fileExt, 'fileExt2::', fileExt2, ' contentType::', contentType, ' encoding::', encoding);
        console.log('filePathOrig:: ', filePathOrig);
        console.log('filePath:: ', filePath);
        console.log('acceptEncoding:: ', this.opts.acceptEncoding);
      }


      if (fs.existsSync(filePath)) {
        try {

          /*** A) set headers defined in the opts ***/
          const headerProps = Object.keys(this.opts.headers);
          for (const headerProp of headerProps) {
            res.setHeader(headerProp, this.opts.headers[headerProp]);
          }
          res.setHeader('Content-Type', contentType);



          /*** B) compress response ***/
          let acceptEncodingBrowser = req.headers['accept-encoding']; // defines what browser can accept
          if (!acceptEncodingBrowser) { acceptEncodingBrowser = ''; }

          const raw = fs.createReadStream(filePath);

          // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
          if (acceptEncodingBrowser.match(/\bgzip\b/) && this.opts.acceptEncoding === 'gzip') {
            res.writeHead(200, { 'Content-Encoding': 'gzip' });
            raw.pipe(zlib.createGzip()).pipe(res);
          } else if (acceptEncodingBrowser.match(/\bdeflate\b/) && this.opts.acceptEncoding === 'deflate') {
            res.writeHead(200, { 'Content-Encoding': 'deflate' });
            raw.pipe(zlib.createDeflate()).pipe(res);
          } else {
            res.writeHead(200);
            raw.pipe(res);
          }


        } catch (err) {
          console.log(err);
        }


      } else { // file doesn't exist
        const errMsg = `NOT FOUND: "${filePath}"`;
        res.writeHead(404, {'X-Error': errMsg});
        console.log(errMsg);
        res.end();
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
