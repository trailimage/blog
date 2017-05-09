const util = require('util');
const C = require('../../lib/constants').default;
const is = require('../../lib/is').default;

/** @type {MockResponse} */
module.exports = {
   httpStatus: C.httpStatus.OK,
   /**
    * Method to call when response is complete. Can be assigned as test
    * middleware next() method so that response.end() and middelware next()
    * are both captured
    */
   onEnd: null,
   /** Whether response should be ended after render is called */
   endOnRender: true,
   ended: false,
   headers: {},
   content: null,
   rendered: {
      template: null,
      options: null,
      json: null
   },
   redirected: {
      status: null,
      url: null
   },
   status(value) { this.httpStatus = value; return this; },
   notFound() { return this.status(C.httpStatus.NOT_FOUND); },
   setHeader(key, value) { this.headers[key] = value; return this; },

   /**
    * Set header value(s)
    * @param {string|object} keyOrHash
    * @param {string} [value]
    */
   set(keyOrHash, value) {
      if (value !== undefined) {
         this.headers[keyOrHash] = value;
      } else if (typeof keyOrHash == is.type.OBJECT) {
         Object.assign(this.headers, keyOrHash)
      }
   },

   redirect(status, url) {
      this.redirected.status = status;
      this.redirected.url = url;
      this.end();
   },

   /**
    * Method added by Express
    * @param {object} o
    */
   json(o) {
      this.httpStatus = C.httpStatus.OK;
      this.rendered.json = o;
      return this.setHeader('Content-Type', C.mimeType.JSON).end();
   },

   /**
    * Serialize render options rather than actually rendering a view
    */
   render(template, options, callback) {
      delete options['config'];
      this.rendered.template = template;
      this.rendered.options = options;

      if (is.callable(callback)) {
         callback(null, util.inspect(this.rendered));
      }
      if (this.endOnRender) { this.end(); }

   },
   /**
    * @param {string|Buffer} chunk
    * @param {string} [encoding]
    * @param {function} [callback]
    * @see https://nodejs.org/api/stream.html#stream_class_stream_writable
    */
   write(chunk, encoding = C.encoding.UTF8, callback) {
      const text = Buffer.isBuffer(chunk) ? chunk.toString(encoding) : chunk;
      this.content = (this.content === null) ? text : this.content + text;
      if (is.callable(callback)) { callback(); }
      return true;
   },

   end() {
      if (!this.ended) {
         this.ended = true;
         if (is.callable(this.onEnd)) { this.onEnd(); }
      }
      return this;
   },
   reset() {
      this.httpStatus = C.httpStatus.OK;
      this.onEnd = null;
      this.ended = false;
      this.headers = {};
      this.content = null;
      this.endOnRender = true;
      this.rendered = {
         template: null,
         options: null,
         json: null
      };
      this.redirected = {
         status: null,
         url: null
      };
      return this;
   }
};