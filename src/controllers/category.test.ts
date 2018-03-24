import { Page } from '../views/index';
import { RouteParam } from '../routes';
import { category } from './index';

import '@toba/test';

beforeAll(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

test('renders home page for default category', () => {
   res.onEnd = () => {
      const options = expectTemplate(Page.Category);
      expect(options).toHaveAllProperties(
         'description',
         'headerCSS',
         'jsonLD',
         'posts',
         'subtitle',
         'title'
      );
   };
   category.home(req, res);
});

test('renders a list of subcategories', () => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.CATEGORY_LIST);
      expect(options).toHaveAllProperties(
         'description',
         'headerCSS',
         'jsonLD',
         'subcategories',
         'subtitle',
         'title'
      );
   };
   req.params[RouteParam.RootCategory] = 'what';
   category.list(req, res);
});

test('displays category at path', () => {
   res.onEnd = () => {
      const options = expectTemplate(Page.CategoryList);
      expect(options).toHaveAllProperties(
         'description',
         'headerCSS',
         'jsonLD',
         'subcategories',
         'subtitle',
         'title'
      );
   };
   req.params[RouteParam.RootCategory] = 'when';
   req.params[RouteParam.Category] = '2016';
   category.list(req, res);
});

test('creates category menu', done => {
   res.onEnd = () => {
      const options = expectTemplate(Page.CategoryMenu);
      expect(options).toHaveAllProperties('description', 'library');
      done();
   };
   category.menu(req, res);
});
