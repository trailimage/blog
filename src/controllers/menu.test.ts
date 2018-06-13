import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { Header } from '@toba/tools';
import { menu } from '../controllers/';
import { Page } from '../views/';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

test('builds data for main menu', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.PostMenuData);
      expect(res.headers).toHaveKeyValue(Header.Vary, Header.Accept.Encoding);
      expect(res.rendered.context).toHaveProperty('blog');
      done();
   };
   menu.data(req, res);
});

it('renders mobile menu', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.MobileMenuData);
      expect(res.rendered.context).toHaveProperty('blog');
      done();
   };
   menu.mobile(req, res);
});
