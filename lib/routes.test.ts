import '@toba/test';
import config from './config';
import route from './routes';

const app = require('./mocks/express.mock');

beforeAll(() => {
   route.standard(app);
});

test('creates admin routes', () => {
   const base = '/admin';
   expect(app.middleware).toHaveProperty(base);
   expect(app.routes.get).toHaveProperty(base + '/');
   expect(app.routes.post).toHaveAllProperties(
      `${base}/map/delete`,
      `${base}/view/delete`
   );
});

test('creates series routes', () => {
   const base = '/:postKey([\\w\\d-]{4,})';
   expect(app.middleware).toHaveProperty(base);
   expect(app.routes.get).toHaveProperty(base + '/');
   expect(app.routes.get).toHaveProperty(base + '/gpx');
});

test('creates photo tag routes', () => {
   const base = '/photo-tag';
   const ph = ':' + C.route.PHOTO_TAG;
   expect(app.middleware).toHaveProperty(base);
   expect(app.routes.get).toHaveProperty(base + '/');
   expect(app.routes.get).toHaveProperty(base + '/' + ph);
   expect(app.routes.get).toHaveProperty(base + '/search/' + ph);
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
test('forwards deprecated urls to new location', () => {
   expect(app.routes.get).to.contain.all.keys(
      Object.keys(config.redirects).map(r => '/' + r)
   );
});
