'use strict';

const TI = require('../');
const is = TI.is;
const config = TI.config;
const LD = TI.LinkData;
const Image = LD.Image;
const Content = LD.CreativeWork;
const BlogPost = LD.BlogPost;
const Person = LD.Person;
const SearchAction = LD.SearchAction;
const Organization = LD.Organization;
const WebPage = LD.WebPage;
const WebSite = LD.WebSite;

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

		ld.id = LinkDataFactory.slugID(post.slug);
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
		ld.id = LinkDataFactory.slugID(slug);
		return ld;
	}

	// http://schema.org/docs/actions.html
	static webSite() {
		let ld = new WebSite();
		let logo = new Image();

		logo.url = size.url;
		logo.width = size.width;
		logo.height = size.height;

		ld.url = 'http://www.' + config.domain + '/';
		ld.name = config.title;
		ld.potentialAction = LinkDataFactory.search();
		ld.logo = logo;


	//	"@context": "http://schema.org",
	//	"@type": "WebSite",
	//	"url": "http://www.{{config.domain}}/",
	//	"logo": "http://www.{{config.domain}}/img/logo.png",
	//	"name": "Trail Image",
	//	"potentialAction": {
	//		"@type": "SearchAction",
	//		"target": "http://www.{{config.domain}}/search?q={search_term_string}",
	//		"query-input": "required name=search_term_string"
	//	}
	//}

	}

	/**
	 * @param {String} slug
	 * @returns {String}
	 */
	static slugID(slug) { return 'http://www.' + config.domain + '/' + slug; }

	/**
	 * @returns {TI.LinkData.SearchAction}
	 * @see http://schema.org/docs/actions.html
	 */
	static search() {
		const placeHolder = 'search_term_string';
		let action = new SearchAction();

		action.target = 'http://www.' + config.domain + '/search?q={' + placeHolder + '}';
		action.queryInput = 'required name=' + placeHolder;

		return action;
	}

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