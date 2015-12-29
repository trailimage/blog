'use strict';

const TI = require('../');
const is = TI.is;
const config = TI.config;
const LD = TI.LinkData;
const Image = LD.Image;
const Content = LD.CreativeWork;
const BlogPost = LD.BlogPost;
const Person = LD.Person;
const Organization = LD.Organization;
const WebPage = LD.WebPage;

/**
 * @alias TI.LinkData.Factory
 */
class LinkDataFactory {
	/**
	 * @alias TI.LinkData.Factory.fromPost
	 * @param {TI.Post} post
	 * @return {TI.LinkData.BlogPost}
	 */
	static fromPost(post) {
		let ld = new BlogPost();
		let content = new Content();

		content.author = LinkDataFactory.owner();
		content.headline = post.title;
		content.description = post.description;
		content.image = LinkDataFactory.fromPhotoSize(post.coverPhoto.size.normal);
		content.publisher = LinkDataFactory.organization();
		content.mainEntityOfPage = LinkDataFactory.webPage(post.slug);
		content.datePublished = post.dateTaken;

		if (is.empty(post.photoTagList)) {
			content.keywords = config.keywords;
		} else {
			content.keywords = config.alwaysKeywords + post.photoTagList;
		}

		if (is.value(post.coverPhoto.size.thumb)) {
			content.image.thumbnail = LinkDataFactory.fromPhotoSize(post.coverPhoto.size.thumb);
		}

		ld.id = LinkDataFactory.idURL(post.slug);
		ld.sharedContent = content;

		return ld;
	//	{
	//	"@context": "http://schema.org",
	//	"@type": "NewsArticle",
	//	"mainEntityOfPage":{
	//		"@type":"WebPage",
	//		"@id":"http://www.{{config.domain}}"
	//	},
	//	"headline": "{{post.title}}",
	//	"image": {
	//		"@type": "ImageObject",
	//		"url": "{{post.coverPhoto.size.normal.url}}",
	//		"height": {{post.coverPhoto.size.normal.height}},
	//		"width": {{post.coverPhoto.size.normal.width}}
	//	},
	//{{#if post.dateTaken}}
	//	"datePublished": "2015-02-05T08:00:00+08:00",
	//{{/if}}
	//	"author": {
	//		"@type": "Person",
	//		"name": "{{post.author}}"
	//	},
	//	"publisher": {
	//		"@type": "Organization",
	//		"name": "Trail Image",
	//		"logo": {
	//			"@type": "ImageObject",
	//			"url": "http://www.{{config.domain}}/img/logo.png",
	//			"width": 96,
	//			"height": 96
	//		}
	//	}
	//
	}

	/**
	 * @param {TI.PhotoSize} size
	 * @returns {TI.LinkData.Image}
	 */
	static fromPhotoSize(size) {
		let ld = new Image();

		ld.url = size.url;
		ld.width = size.width;
		ld.height = size.height;

		return ld;
	}

	/**
	 *
	 * @param {String} [slug]
	 * @return {TI.LinkData.WebPage}
	 */
	static webPage(slug) {
		if (is.empty(slug)) { slug = ''; }
		let ld = new WebPage();
		ld.id = LinkDataFactory.idURL(slug);
		return ld;
	}

	/**
	 * @param {String} slug
	 * @returns {String}
	 */
	static idURL(slug) { return 'http://www.' + config.domain + '/' + slug;	}

	/**
	 * @return {TI.LinkData.Organization}
    */
	static organization() {
		let org = new Organization();
		let logo = new Image();

		logo.url = 'http://www.' + config.domain + '/img/logo.png';
		logo.width = 96;
		logo.height = 96;

		org.name = config.title;
		org.logo = logo;

		return org;
	}

	/**
	 * @alias TI.LinkData.Factory.owner
	 * @returns {TI.LinkData.Person}
	 */
	static owner() {
		let a = new Person();
		let img = new Image();

		img.url = config.owner.image.url;
		img.width = config.owner.image.width;
		img.height = config.owner.image.height;

		a.name = config.owner.name;
		a.url = 'http://www.' + config.domain + '/about';
		a.sameAs = config.owner.urls;
		a.image = img;

		return a;
	}
}

module.exports = LinkDataFactory;