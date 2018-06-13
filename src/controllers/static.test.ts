import '@toba/test';
import { Header, MimeType. addCharSet } from '@toba/tools';
import { MockRequest, MockResponse } from '@toba/test';
import { Page } from '../views/index';
import { staticPage } from './static';
import { config } from '../config';

const req = new MockRequest();
const res = new MockResponse(req);
const wasCached = config.cache.views;

beforeAll(() => {
   config.cache.views = false;
});

afterAll(() => {
   config.cache.views = wasCached;
});

beforeEach(() => {
   res.reset();
   req.reset();
   res.endOnRender = true;
});

test('renders sitemap', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Sitemap);
      const context = res.rendered.context;
      expect(context).toHaveAllProperties('posts', 'categories', 'tags');
      expect(res.headers).toHaveKeyValue(
         Header.Content.Type,
         addCharSet(MimeType.XML)
      );
      done();
   };
   res.endOnRender = false;
   staticPage.siteMap(req, res);
});

test('redirects to issues page', done => {
   res.onEnd = () => {
      expect(res).toRedirectTo('http://issues.' + config.domain);
      done();
   };
   staticPage.issues(req, res);
});

test('displays search results', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Search);
      expect(res.rendered.context).toBeDefined();
      done();
   };
   req.query['q'] = 'search';
   staticPage.search(req, res);
});
