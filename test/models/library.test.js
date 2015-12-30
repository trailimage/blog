'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Library Model', ()=> {
	let l = new TI.Library();

	it('finds post tags by their slug', ()=> {
		let t = new TI.PostTag();
		let child = new TI.PostTag();

		t.title = 'Slug Name';
		t.slug = 'slug';

		child.title = 'Child Name';
		child.slug = 'child-slug';

		t.tags.push(child);

		l.tags[t.title] = t;

		// find root tag
		expect(l.tagWithSlug('slug')).equals(t);
		// find child tag
		expect(l.tagWithSlug('slug','child-slug')).equals(child);
		// find child tag with URL format
		expect(l.tagWithSlug('slug/child-slug')).equals(child);

		expect(l.tagWithSlug('slug/nothing')).is.null;
	});
});