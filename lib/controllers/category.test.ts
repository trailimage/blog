import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { RouteParam } from '../routes';
import { Page } from '../views/index';
import { category } from './index';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

const contextKeys = [
   'description',
   'headerCSS',
   'jsonLD',
   'subcategories',
   'subtitle',
   'title'
];

test('renders home page for default category', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Category);
      expect(res.rendered.context).toHaveAllProperties(...contextKeys);
      done();
   };
   category.home(req, res);
});

test('renders a list of subcategories', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryList);
      expect(res.rendered.context).toHaveAllProperties(...contextKeys);
      done();
   };
   req.params[RouteParam.RootCategory] = 'what';
   category.list(req, res);
});

test('displays category at path', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryList);
      expect(res.rendered.context).toHaveAllProperties(...contextKeys);
      done();
   };
   req.params[RouteParam.RootCategory] = 'when';
   req.params[RouteParam.Category] = '2016';
   category.list(req, res);
});

test('creates category menu', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryMenu);
      expect(res.rendered.context).toHaveAllProperties(
         'description',
         'library'
      );
      done();
   };
   category.menu(req, res);
});
