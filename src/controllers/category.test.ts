import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { Page } from '../views/index';
import { RouteParam } from '../routes';
import { category } from './index';
import { expectTemplate } from './index.test';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

test('renders home page for default category', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.Category);
      expect(options).toHaveAllProperties(
         'description',
         'headerCSS',
         'jsonLD',
         'posts',
         'subtitle',
         'title'
      );
      done();
   };
   category.home(req, res);
});

test('renders a list of subcategories', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.CategoryList);
      expect(options).toHaveAllProperties(
         'description',
         'headerCSS',
         'jsonLD',
         'subcategories',
         'subtitle',
         'title'
      );
      done();
   };
   req.params[RouteParam.RootCategory] = 'what';
   category.list(req, res);
});

test('displays category at path', done => {
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
      done();
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
