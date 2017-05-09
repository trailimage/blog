const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate } = require('./index.test');
const template = require('../../lib/template').default;
const mocha = require('mocha');
const { expect } = require('chai');
const menu = require('../../lib/controllers/menu').default;

describe('Menu Controller', ()=> {
   before(done => prepare(done));
   beforeEach(() => { res.reset(); req.reset(); });

   it('builds data for main menu', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.POST_MENU_DATA);
         expect(res.headers).has.property('Vary', 'Accept-Encoding');
         expect(options).has.property('library');
         done();
      };
      menu.data(req, res);
   });

   it('renders mobile menu', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.MOBILE_MENU_DATA);
         expect(options).has.property('library');
         done();
      };
      menu.mobile(req, res);
   });
});