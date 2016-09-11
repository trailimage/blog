'use strict';

const C = require('../lib/constants');
const config = require('../lib/config');
const res = require('./mocks/response.mock');
const req = require('./mocks/request.mock');
const mocha = require('mocha');
const { expect } = require('chai');
const controller = require('../lib/controller');

describe('Controller', ()=> {
   describe('Post', ()=> {
      const oldBlog = 'great-post';
      req.params['year'] = '2014';
      req.params['month'] = '08';
      req.params['slug'] = 'post-slug';

      config.blog = {
         domain: 'blog.test.com',
         redirects: { [oldBlog]: 'still-a-great-post' }
      };

      it('forwards matched slugs to new location', ()=> {
         req.params['slug'] = oldBlog;
         postController.blog(req, res);
         expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
         expect(res.redirected.url).equals('/' + config.blog.redirects[oldBlog]);
      });
   });
});