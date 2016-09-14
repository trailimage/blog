'use strict';

const util = require('util');
const C = require('../../lib/constants');
const is = require('../../lib/is');

/** @type {MockResponse} */
module.exports = {
   httpStatus: C.httpStatus.OK,
   // method to call when response is complete
   // can be assigned as test middleware next() method so that response.end() and middelware next() are both captured
   onEnd: null,
   ended: false,
   headers: {},
   content: new Buffer(''),
   listeners: {},
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
    * @param {String|Object} keyOrHash
    * @param {String} [value]
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
    * @param {Object} o
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
      this.end();

   },
   /**
    * May be called to end streaming
    * @param {String|Buffer} [chunk]
    * @param {String} [encoding]
    * @param {function} [callback]
    */
   end(chunk, encoding, callback) {
      if (is.value(chunk)) {
         if (is.callable(callback)) { this.on('finish', callback); }
         // send to stream writer
         this.write(chunk, encoding);
      }
      if (!this.ended) {
         this.ended = true;
         this.emit('close');
         this.emit('finish');
         if (is.callable(this.onEnd)) { this.onEnd(); }
      }
      return this;
   },
   reset() {
      this.httpStatus = C.httpStatus.OK;
      this.onEnd = null;
      this.ended = false;
      this.headers = {};
      this.content = new Buffer('');
      this.listeners = {};
      this.rendered = {
         template: null,
         options: null,
         json: null
      };
      this.redirected = {
         status: null,
         url: null
      };
      this.defaultEncoding = 'utf8';
      return this;
   },

   //region Stream and Event

   defaultEncoding: 'utf8',
   streamStore: new Buffer(''),

   /**
    * @param {String|Buffer} chunk
    * @param {String} [encoding]
    * @param {function} [callback]
    * @see https://nodejs.org/api/stream.html#stream_class_stream_writable
    */
   write(chunk, encoding = this.defaultEncoding, callback) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, encoding);
      this.content = Buffer.concat(this.content, buffer);
      if (is.callable(callback)) { callback(); }
      return true;
   },

   /**
    * @param {String} eventName
    * @param {function} listener
    */
   on(eventName, listener) {
      if (is.callable(listener)) {
         if (!is.defined(this.listeners, eventName)) { this.listeners[eventName] = []; }
         this.listeners[eventName].push(listener);
      }
   },

   /**
    * @param {String} eventName
    */
   emit(eventName) {
      if (is.defined(this.listeners, eventName)) {
         this.listeners[eventName].forEach(l => l());
      }
   },

   /**
    * @param {String} eventName
    * @param {function} listener
    */
   removeListener(eventName, listener) {
      if (is.defined(this.listeners, eventName)) {
         let list = this.listeners[eventName];
         const index = list.indexOf(listener);
         if (index >= 0) { list = list.splice(index, 1); }
      }
   },

   /**
    * @param {String} encoding
    */
   setDefaultEncoding(encoding) { this.defaultEncoding = encoding; return this; },

   /**
    * @see https://nodejs.org/api/stream.html#stream_writable_cork
    */
   cork() {},
   uncork() {},

   //endregion
};