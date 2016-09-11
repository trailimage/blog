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
   content: null,
   rendered: {
      template: null,
      options: null
   },
   redirected: {
      status: null,
      url: null
   },
   status(value) { this.httpStatus = value; return this; },
   notFound() { return this.status(C.httpStatus.NOT_FOUND); },
   setHeader(key, value) { this.headers[key] = value; return this; },
   write(value) { this.content = value; return this; },
   redirect(status, url) {
      this.redirected.status = status;
      this.redirected.url = url;
      this.end();
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
   end() {
      if (this.ended) {
         console.warn('MockResponse.end() called after it already ended');
      } else {
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
      this.rendered = {
         template: null,
         options: null
      };
      this.redirected = {
         status: null,
         url: null
      };
      return this;
   }
};