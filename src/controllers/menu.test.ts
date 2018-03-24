const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
import { prepare, expectTemplate } from './index.test';
import { Page } from '../views/';
import menu from '../controllers/menu';

beforeAll(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

test('builds data for main menu', () => {
   res.onEnd = () => {
      const options = expectTemplate(Page.PostMenuData);
      expect(res.headers).toHaveProperty('Vary', 'Accept-Encoding');
      expect(options).toHaveProperty('library');
   };
   menu.data(req, res);
});

it('renders mobile menu', () => {
   res.onEnd = () => {
      const options = expectTemplate(Page.MobileMenuData);
      expect(options).toHaveProperty('library');
   };
   menu.mobile(req, res);
});
