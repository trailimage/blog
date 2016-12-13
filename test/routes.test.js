const mocha = require('mocha');
const C = require('../lib/constants');
const config = require('../lib/config');
const { expect } = require('chai');
const route = require('../lib/routes');
const app = require('./mocks/express.mock');

describe('Routes', ()=> {
   before(() => { route.standard(app); });

   it('creates admin routes', ()=> {
      const base = '/admin';
      expect(app.middleware).has.property(base);
      expect(app.routes.get).has.property(base + '/');
      expect(app.routes.post).to.contain.all.keys([`${base}/map/delete`, `${base}/view/delete`]);
   });

   it('creates series routes', ()=> {
      const base = '/:postKey([\\w\\d-]{4,})';
      expect(app.middleware).has.property(base);
      expect(app.routes.get).has.property(base + '/');
      expect(app.routes.get).has.property(base + '/gpx');
   });

   it('creates photo tag routes', ()=> {
      const base = '/photo-tag';
      const ph = ':' + C.route.PHOTO_TAG;
      expect(app.middleware).has.property(base);
      expect(app.routes.get).has.property(base + '/');
      expect(app.routes.get).has.property(base + '/' + ph);
      expect(app.routes.get).has.property(base + '/search/' + ph);
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
