import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { expectTemplate } from './index.test';
import { Page } from '../views/';
import { menu } from '../controllers/index';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

test('builds data for main menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.PostMenuData);
      expect(res.headers).toHaveProperty('Vary', 'Accept-Encoding');
      expect(options).toHaveProperty('library');
      done();
   };
   menu.data(req, res);
});

it('renders mobile menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.MobileMenuData);
      expect(options).toHaveProperty('library');
      done();
   };
   menu.mobile(req, res);
});
