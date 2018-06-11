import '@toba/test';
import { config } from './config/';
import { route, RouteParam } from './routes';
import Express from 'express';

const app: Express.Application = Express();

beforeAll(() => {
   route.standard(app);
});

test('creates series routes', () => {
   const base = '/:postKey([\\w\\d-]{4,})';
   //expect(app.middleware).toHaveProperty(base);
   expect(app.routes.get).toHaveValues(base + '/', base + '/gpx');
});

test('creates photo tag routes', () => {
   const base = '/photo-tag';
   const ph = ':' + RouteParam.PhotoTag;
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
   expect(app.routes.get).toHaveAllProperties(
      ...Object.keys(config.redirects).map(r => '/' + r)
   );
});
