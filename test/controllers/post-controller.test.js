'use strict';

const TI = require('../');
const config = TI.Blog;
const mocha = require('mocha');
const expect = require('chai').expect;
const PostController = TI.Controller.post;

describe('Post Controller', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();

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
			expect(res.redirected.status).equals(TI.httpStatus.temporaryRedirect);
			expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params['year']}/${req.params['month']}/${req.params['slug']}`)
		});

		it('forwards matched slugs to new location', ()=> {
			req.params['slug'] = oldBlog;
			PostController.blog(req, res);
			expect(res.redirected.status).equals(TI.httpStatus.permanentRedirect);
			expect(res.redirected.url).equals('/' + config.blog.redirects[oldBlog]);
		});
	});
});