const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate } = require('./index.test');
const template = require('../../lib/template').default;
const mocha = require('mocha');
const { expect } = require('chai');
const category = require('../../lib/controllers/category').default;
const { route: ph } = require('../../lib/constants').default;

describe('Category Controller', () => {
   before(done => prepare(done));
   beforeEach(() => {
      res.reset();
      req.reset();
   });

   it('renders home page for default category', done => {
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

   it('renders a list of subcategories', done => {
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

   it('displays category at path', done => {
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

   it('creates category menu', done => {
      res.onEnd = () => {
         const options = expectTemplate(template.page.CATEGORY_MENU);
         expect(options).to.contain.all.keys(['description', 'library']);
         done();
      };
      category.menu(req, res);
   });
});
