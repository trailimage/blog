'use strict';

const mocha = require('mocha');
const config = require('../lib/config');
const { expect } = require('chai');
const route = require('../lib/routes');
const app = require('./mocks/express.mock');

describe('Routes', ()=> {
   before(() => { route.standard(app); });

   it('creates admin routes', ()=> {
      expect(app.middleware).has.property('/admin');
      expect(app.routes.get).has.property('/admin/');
      expect(app.routes.post).to.contain.all.keys(['/admin/map/delete', '/admin/view/delete'])
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
   it('forwards deprecated urls to new location', ()=> {
      expect(app.routes.get).to.contain.all.keys(Object.keys(config.redirects).map(r => '/' + r));
   });
});
