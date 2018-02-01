import res from '../__mocks__/response.mock';
import req from '../__mocks__/request.mock';
const { prepare, expectTemplate } = require('./index.test');
import template from '../template';
import category from './category';
import { route as ph } from '../constants';

beforeAll(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

test('renders home page for default category', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.CATEGORY);
      expect(options).to.contain.all.keys([
         'description',
         'headerCSS',
         'jsonLD',
         'posts',
         'subtitle',
         'title'
      ]);
      done();
   };
   category.home(req, res);
});

test('renders a list of subcategories', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.CATEGORY_LIST);
      expect(options).to.contain.all.keys([
         'description',
         'headerCSS',
         'jsonLD',
         'subcategories',
         'subtitle',
         'title'
      ]);
      done();
   };
   req.params[ph.ROOT_CATEGORY] = 'what';
   category.list(req, res);
});

test('displays category at path', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.CATEGORY_LIST);
      expect(options).to.contain.all.keys([
         'description',
         'headerCSS',
         'jsonLD',
         'subcategories',
         'subtitle',
         'title'
      ]);
      done();
   };
   req.params[ph.ROOT_CATEGORY] = 'when';
   req.params[ph.CATEGORY] = '2016';
   category.list(req, res);
});

test('creates category menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.CATEGORY_MENU);
      expect(options).to.contain.all.keys(['description', 'library']);
      done();
   };
   category.menu(req, res);
});
