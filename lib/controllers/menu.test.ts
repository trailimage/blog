import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { Header } from '@toba/tools';
import { menu } from '../controllers/';
import { Page } from '../views/';
import { expectTemplate } from './index.test';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

test('builds data for main menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.PostMenuData);
      expect(res.headers).toHaveProperty(Header.Vary, Header.Accept.Encoding);
      expect(options).toHaveProperty('blog');
      done();
   };
   menu.data(req, res);
});

it('renders mobile menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.MobileMenuData);
      expect(options).toHaveProperty('blog');
      done();
   };
   menu.mobile(req, res);
});
