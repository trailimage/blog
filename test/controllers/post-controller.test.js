'use strict';

const lib = require('../');
const config = lib.config;
const Enum = lib.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const PostController = lib.Controller.post;
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