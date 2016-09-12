'use strict';

const mocha = require('mocha');
const { expect } = require('chai');
const route = require('../lib/routes');
const app = require('./mocks/express.mock');

describe('Routes', ()=> {
   before(() => {
      route.standard(app);
   });

   // it.skip('forwards old blog paths to new location', ()=> {
   //    req.params[ph.YEAR] = '2014';
   //    req.params[ph.MONTH] = '08';
   //    req.params[ph.POST_KEY] = 'post-slug';
   //    c.post.date(req, res);
   //    expect(res.redirected.status).equals(C.httpStatus.TEMP_REDIRECT);
   //    expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params[ph.YEAR]}/${req.params[ph.MONTH]}/${req.params[ph.POST_KEY]}`)
   // });
   //
   // it.skip('forwards deprecated slugs to new location', ()=> {
   //    const oldPostKey = 'great-post';
   //
   //    config.blog = {
   //       domain: 'blog.test.com',
   //       redirects: { [oldPostKey]: 'still-a-great-post' }
   //    };
   //
   //    req.params[ph.POST_KEY] = oldPostKey;
   //    c.post.view(req, res);
   //    expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
   //    expect(res.redirected.url).equals('/' + config.blog.redirects[oldPostKey]);
   // });

});
