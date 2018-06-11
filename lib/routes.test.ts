import '@toba/test';
import { config } from './config/';
import { route, RouteParam } from './routes';
import { ExpressApp } from './express-mock';
import { loadMockData } from './.test-data';

const app = new ExpressApp();

beforeAll(async done => {
   await loadMockData();
   route.standard(app);
   done();
});

test('creates series routes', () => {
   const base = '/:postKey([\\w\\d-]{4,})';
   expect(app.middleware).toHaveKeys(base);
   expect(app.routes.get).toHaveKeys(base + '/', base + '/gpx');
});

test('creates photo tag routes', () => {
   const base = '/photo-tag';
   const ph = ':' + RouteParam.PhotoTag;
   expect(app.middleware).toHaveKeys(base);
   expect(app.routes.get).toHaveKeys(
      base + '/',
      base + '/' + ph,
      base + '/search/' + ph
   );
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
   expect(app.routes.get).toHaveKeys(
      ...Object.keys(config.redirects).map(r => '/' + r)
   );
});
