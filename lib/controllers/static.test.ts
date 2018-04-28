import '@toba/test';
import { Header, MimeType } from '@toba/tools';
import { MockRequest, MockResponse } from '@toba/test';
import { Page } from '../views/index';
import { staticPage } from './static';
import { expectTemplate, expectRedirect } from './index.test';
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
   res.endOnRender = false;
});

test('renders sitemap', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.Sitemap);
      expect(options).toHaveAllProperties('posts', 'categories', 'tags');
      expect(res.headers).toHaveKeyValue(
         Header.Content.Type,
         MimeType.XML + ';charset=utf-8'
      );
      done();
   };
   staticPage.siteMap(req, res);
});

test('redirects to issues page', done => {
   res.onEnd = () => {
      expectRedirect(res, 'http://issues.' + config.domain);
      done();
   };
   staticPage.issues(req, res);
});
