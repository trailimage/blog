'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Post = require('../../lib/models/post.js');

describe('Post Model', ()=> {
	let p = new Post();

	it('indicates if it has tags', ()=> {
		expect(p.hasTags).is.false;
		p.tags.push('anything');
		expect(p.hasTags).is.true;
	});
});