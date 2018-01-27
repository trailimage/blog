import res from './response.mock';
import { httpStatus } from '../constants';

beforeEach(() => res.reset());

test('allows setting and reading the HTTP status', () => {
   res.status(httpStatus.NOT_FOUND);
   expect(res.httpStatus).equals(httpStatus.NOT_FOUND);
});

test('accepts headers', () => {
   res.setHeader('Cache-Control', 'no-cache');
   res.setHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
   res.setHeader('pragma', 'no-cache');

   expect(res.headers).has.property('pragma', 'no-cache');

   res.set({
      'Fake-Header1': 'header-value1',
      'Fake-Header2': 'header-value2'
   });

   expect(res.headers).has.property('Fake-Header1', 'header-value1');
   expect(res.headers).has.property('Fake-Header2', 'header-value2');
});

test('can be written to', () => {
   const html = '<html><head></head><body>Test Page</body></html>';
   res.write(html);
   expect(res.content).toBe(html);
});

test('captures redirects', () => {
   res.redirect(C.httpStatus.PERMANENT_REDIRECT, 'url');
   expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
   expect(res.redirected.url).equals('url');
});

test('simulates template rendering', done => {
   res.render('template', { key1: 'value1', key2: 'value2' }, (err, text) => {
      expect(err).toBeNull();
      expect(res.rendered).has.property('template', 'template');
      expect(res.rendered).has.property('options');
      expect(res.rendered.options).has.property('key1', 'value1');
      expect(res.rendered.options).has.property('key2', 'value2');
      done();
   });
});

test('provides a 404 convenience method', () => {
   res.notFound();
   expect(res.httpStatus).equals(httpStatus.NOT_FOUND);
});

test('tracks whether response is ended', () => {
   res.end();
   expect(res.ended).toBe(true);
});

test('can be reset and re-used', () => {
   res.reset();
   expect(res.ended).toBe(false);
   expect(res.httpStatus).toBe(httpStatus.OK);
});
