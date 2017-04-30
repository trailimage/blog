const C = require('../../lib/constants').default;
const cache = require('../../lib/cache').default;
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const middleware = require('../../lib/middleware').default;
const factory = require('../../lib/factory').default;
const mocha = require('mocha');
const { expect } = require('chai');
const c = require('../../lib/controllers/').default;

/**
 * Expect standard Handlexitebars template response
 * @param {string} name Template name
 * @returns {object}
 */
function expectTemplate(name) {
   expect(res.httpStatus).equals(C.httpStatus.OK);
   expect(res.rendered).has.property('template', name);
   expect(res.rendered).has.property('options');
   return res.rendered.options;
}

/**
 * @param {string} path Redirection target
 */
function expectRedirect(path) {
   expect(res.redirected).to.exist;
   expect(res.redirected).has.property('status', C.httpStatus.PERMANENT_REDIRECT);
   expect(res.redirected).has.property('url', path);
}

/**
 * Expectations for JSON responses
 * @returns {string|object} response content
 */
function expectJSON() {
   expect(res.httpStatus).equals(C.httpStatus.OK);
   expect(res.headers).has.property(C.header.content.TYPE, C.mimeType.JSON);
   expect(res.rendered).has.property('json');
   expect(res.rendered.json).has.property('success', true);
   expect(res.rendered.json).has.property('message');
   return res.rendered.json.message;
}

/**
 * Run exists() method for each key and confirm it does or does not exist
 * @param {string[]} keys
 * @param {boolean} [exists]
 * @returns {Promise}
 */
function expectInCache(keys, exists = true) {
   return Promise
      .all(keys.map(k => cache.view.exists(k)))
      // all() returns an array of outputs from each method
      .then(results => { results.forEach(r => expect(r).equals(exists)); });
}

/**
 * @param {function} done
 */
function prepare(done) {
   factory.inject.flickr = require('../mocks/flickr.mock');
   factory.inject.google = require('../mocks/google.mock');
   factory.buildLibrary().then(() => {
      middleware.enableStatusHelpers(req, res, ()=> {
         middleware.enableViewCache(req, res, done);
      });
   });
}

module.exports = { prepare, expectTemplate, expectRedirect, expectJSON, expectInCache };