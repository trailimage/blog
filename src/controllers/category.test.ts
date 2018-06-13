import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { RouteParam } from '../routes';
import { Page } from '../views/index';
import { category } from './index';
import { loadMockData } from '../.test-data';

const req = new MockRequest();
const res = new MockResponse(req);

beforeAll(async done => {
   await loadMockData();
   console.debug = console.log = jest.fn();
   done();
});

beforeEach(() => {
   res.reset();
});

const contextKeys = [
   'description',
   'headerCSS',
   'linkData',
   'subtitle',
   'title'
];

test('renders home page for default category', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Category);
      const context = res.rendered.context;
      expect(context).toHaveAllProperties('posts', ...contextKeys);
      // Link Data should be serialized to linkData field
      expect(context).not.toHaveProperty('jsonLD');
      expect(context).not.toHaveProperty('subcategories');
      expect(context['posts']).toHaveLength(5);
      expect(context.title).toBe('2016');
      expect(context.subtitle).toBe('Five Adventures');
      done();
   };
   category.home(req, res);
});

test('renders a list of subcategories', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryList);
      const context = res.rendered.context;
      expect(context).toHaveAllProperties('subcategories', ...contextKeys);
      expect(context['subcategories']).toHaveLength(7);
      expect(context.title).toBe('What');
      done();
   };
   req.params[RouteParam.RootCategory] = 'what';
   category.list(req, res);
});

test('displays category at path', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryList);
      const context = res.rendered.context;
      expect(context).toHaveAllProperties('subcategories', ...contextKeys);
      expect(context.title).toBe('When');
      expect(context.subtitle).toBe('Thirteen Subcategories');
      done();
   };
   req.params[RouteParam.RootCategory] = 'when';
   req.params[RouteParam.Category] = '2016';
   category.list(req, res);
});

test('creates category menu', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.CategoryMenu);
      expect(res.rendered.context).toHaveAllProperties('description', 'blog');
      done();
   };
   category.menu(req, res);
});
