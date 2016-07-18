'use strict';

const Blog = require('@trailimage/blog-core');
const Schema = require('@trailimage/json-ld');
const Factory = require('./');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('JSON-LD Factory', ()=> {
	const siteUrl = 'http://www.testing.com';

	before(() => {
		Factory.config.site = {
			title: 'Test Site Title',
			url: siteUrl,
			logo: {
				url: 'http://site.com/image.jpg',
				width: 75,
				height: 75
			}
		};

		Factory.config.owner = {
			name: 'Owner Name',
			urls: ['http://www.testing2.com','http://www.testing3.com'],
			image: {
				url: 'http://owner.com/image.jpg',
				width: 300,
				height: 300
			}
		};
	});

	it('creates an owner image schema', ()=> {
		let ld = Factory.ownerImage();

		expect(ld.type).equals(Schema.Type.image);
		expect(ld.url).equals('http://owner.com/image.jpg');
		expect(ld.width).equals(300);
	});

	it('creates a site image schema', ()=> {
		let ld = Factory.siteLogo();

		expect(ld.type).equals(Schema.Type.image);
		expect(ld.url).equals('http://site.com/image.jpg');
		expect(ld.width).equals(75);
	});

	it('creates image schema from PhotoSize', ()=> {
		let size = new Blog.PhotoSize();
		size.url = 'http://url.com';
		size.width = 80;
		size.height = 100;

		let ld = Factory.fromPhotoSize(size);

		expect(ld.type).equals(Schema.Type.image);
		expect(ld.url).equals('http://url.com');
		expect(ld.width).equals(80);
	});

	it('creates breadcrumb schemas', ()=> {
		let ld = Factory.breadcrumb('http://url.com', 'Title');

		expect(ld.item).to.exist;
		expect(ld.item.id).equals('http://url.com');
		expect(ld.item.name).equals('Title');
	});

	it('generates fully qualified URL from a relative path', ()=> {
		expect(Factory.pathURL('path')).equals(siteUrl + '/path');
	});

	it('creates organization schemas', ()=> {
		let ld = Factory.organization();

		expect(ld.type).equals(Schema.Type.organization);
		expect(ld.name).equals('Test Site Title');
	});

	it('creates search action schemas', ()=> {
		const placeHolder = 'search_term_string';
		let ld = Factory.searchAction();

		expect(ld.type).equals(Schema.Type.searchAction);
		expect(ld.target).equals(siteUrl + '/search?q={' + placeHolder + '}');
		expect(ld.queryInput).equals('required name=' + placeHolder);
	});

	it('creates web page schemas', ()=> {
		let ld = Factory.webPage('path');

		expect(ld.type).equals(Schema.Type.webPage);
		expect(ld.id).equals(siteUrl + '/path');
	});
});