'use strict';

const config = require('../mock-config.js');
const Enum = require('../../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const PostController = require('../../lib/controllers/post-controller.js');
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Post Controller', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	describe('Blog', ()=> {
		const oldBlog = 'great-post';
		req.params['year'] = '2014';
		req.params['month'] = '08';
		req.params['slug'] = 'post-slug';

		config.blog = {
			domain: 'blog.test.com',
			redirects: { [oldBlog]: 'still-a-great-post' }
		};

		it('forwards unmatched slugs to blog', ()=> {
			PostController.blog(req, res);
			expect(res.redirected.status).equals(Enum.httpStatus.temporaryRedirect);
			expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params['year']}/${req.params['month']}/${req.params['slug']}`)
		});

		it('forwards matched slugs to new location', ()=> {
			req.params['slug'] = oldBlog;
			PostController.blog(req, res);
			expect(res.redirected.status).equals(Enum.httpStatus.permanentRedirect);
			expect(res.redirected.url).equals('/' + config.blog.redirects[oldBlog]);
		});
	});
});