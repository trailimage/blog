const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
import { prepare, expectTemplate } from './index.test';
import template from '../template';
import menu from '../controllers/menu';

beforeAll(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

it('builds data for main menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.POST_MENU_DATA);
      expect(res.headers).toHaveProperty('Vary', 'Accept-Encoding');
      expect(options).toHaveProperty('library');
      done();
   };
   menu.data(req, res);
});

it('renders mobile menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.MOBILE_MENU_DATA);
      expect(options).toHaveProperty('library');
      done();
   };
   menu.mobile(req, res);
});
