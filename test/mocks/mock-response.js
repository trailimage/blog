'use strict';

const { httpStatus } = require('../../lib/enum');
const is = require('../../lib/is');

module.exports = {
   httpStatus: httpStatus.OK,
   ended: false,
   // method to call when response is complete
   // can be assigned as test middleware next() method so that response.end() and middelware next() are both captured
   testCallback: null,
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
   notFound() { return this.status(httpStatus.NOT_FOUND); },
   setHeader(key, value) { this.headers[key] = value; return this; },
   write(value) { this.content = value; return this; },
   redirect(status, url) {
      this.redirected.status = status;
      this.redirected.url = url;
   },
   render(template, options, callback) {
      this.rendered.template = template;
      this.rendered.options = options;
      callback(null, JSON.stringify(this.rendered));
   },
   end() {
      this.ended = true;
      if (is.callable(this.testCallback)) { this.testCallback(); }
   }
};