'use strict';

const TI = require('../');
const is = TI.is;
const config = TI.config;
const LD = TI.LinkData;
const Image = LD.Image;
const BlogPost = LD.BlogPost;
const Person = LD.Person;
const SearchAction = LD.SearchAction;
const Organization = LD.Organization;
const Blog = LD.Blog;
const WebPage = LD.WebPage;
const Video = LD.Video;

/**
 * @alias TI.LinkData.Factory
 * @see https://developers.google.com/structured-data/testing-tool/
 */
class LinkDataFactory {
	/**
	 * @alias TI.LinkData.Factory.fromPost
	 * @param {Blog.Post} post
	 * @return {Blog.LinkData.BlogPost}
	 * @see https://developers.google.com/structured-data/rich-snippets/articles
	 */
	static fromPost(post) {
		let ld = new BlogPost();
		let postTagTitle = [];

		for (let slug in post.tags) { postTagTitle.push(post.tags[slug]); }

		ld.author = LinkDataFactory.owner();
		ld.name = post.title;
		ld.headline = post.title;
		ld.description = post.description;
		ld.image = LinkDataFactory.fromPhotoSize(post.coverPhoto.size.normal);
		ld.publisher = LinkDataFactory.organization();
		ld.mainEntityOfPage = LinkDataFactory.webPage(post.slug);
		ld.datePublished = post.dateTaken;
		ld.dateModified = post.updatedOn;
		ld.articleSection = postTagTitle.join(',');
		// implement video when full source data is ready
		// ld.video = LinkDataFactory.fromVideo(post.video);

		//if (is.empty(post.photoTagList)) {
		//	content.keywords = config.keywords;
		//} else {
		//	content.keywords = config.alwaysKeywords + post.photoTagList;
		//}

		if (is.value(post.coverPhoto.size.thumb)) {
			ld.image.thumbnail = LinkDataFactory.fromPhotoSize(post.coverPhoto.size.thumb);
		}

		return ld;
	}

	/**
	 * @param {Blog.PostTag} tag
	 * @param {String} slug Full slug with category
	 * @param {Boolean} [homePage = false]
	 * @return {Blog.LinkData.Blog|Blog.LinkData.WebSite}
	 * @see https://developers.google.com/structured-data/breadcrumbs
	 */
	static fromPostTag(tag, slug, homePage) {
		if (homePage === undefined) { homePage = false; }
		let ld = null;

		if (homePage) {
			ld = new Blog();
			ld.url = config.site.url;
			ld.name = config.site.title;
			ld.author = LinkDataFactory.owner();
			ld.description = config.site.description;
			ld.mainEntityOfPage = LinkDataFactory.webPage();
			ld.potentialAction = LinkDataFactory.searchAction();
			ld.publisher = LinkDataFactory.organization();
		} else {
			let position = 1;
			let library = TI.Library.current;

			ld = LinkDataFactory.webPage(slug);
			ld.name = tag.title;
			ld.publisher = LinkDataFactory.organization();
			ld.addBreadcrumb(LinkDataFactory.breadcrumb(config.site.url, 'Home', position++));

			if (tag.slug.includes('/')) {
				let rootSlug = tag.slug.split('/')[0];
				let rootTag = library.tagWithSlug(rootSlug);
				ld.addBreadcrumb(LinkDataFactory.breadcrumb(config.site.url + '/' + rootTag.slug, rootTag.title, position++));
			}
			ld.addBreadcrumb(LinkDataFactory.breadcrumb(config.site.url + '/' + tag.slug, tag.title, position));
		}
		return ld;
	}

	/**
	 * @param {Blog.PhotoSize} size
	 * @returns {Blog.LinkData.Image}
	 */
	static fromPhotoSize(size) {
		return Image.fromURL(size.url, size.width, size.height);
	}

	/**
	 *
	 * @param {String} url
	 * @param {String} title
	 * @param {Number} [position]
	 * @return {Blog.LinkData.ListItem}
	 */
	static breadcrumb(url, title, position) {
		let ld = new TI.LinkData.ListItem();

		ld.item.id = url;
		ld.item.name = title;
		if (position !== undefined) { ld.position = position; }

		return ld;
	}

	/**
	 * @returns {Blog.LinkData.Image}
	 */
	static siteLogo() {
		let img = config.site.logo;
		return Image.fromURL(img.url, img.width, img.height);
	}

	/**
	 * @returns {Blog.LinkData.Image}
	 */
	static ownerImage() {
		let img = config.owner.image;
		return Image.fromURL(img.url, img.width, img.height);
	}

	/**
	 * @param {Blog.Video} v
	 * @returns {Blog.LinkData.Video}
	 */
	static fromVideo(v) {
		if (v !== null && !v.empty) {
			let ld = new Video();

			ld.contentUrl = 'https://www.youtube.com/watch?v=' + v.id;
			ld.videoFrameSize = v.width + 'x' + v.height;
			ld.description = null;
			ld.uploadDate = null;
			ld.thumbnailUrl = null;

			return ld;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param {String} [path]
	 * @return {Blog.LinkData.WebPage}
	 */
	static webPage(path) {
		if (is.empty(path)) { path = ''; }
		let ld = new WebPage();
		ld.id = LinkDataFactory.pathURL(path);
		return ld;
	}

	/**
	 * @param {String} path
	 * @returns {String}
	 */
	static pathURL(path) { return config.site.url + '/' + path; }

	/**
	 * @returns {Blog.LinkData.SearchAction}
	 * @see http://schema.org/docs/actions.html
	 */
	static searchAction() {
		const placeHolder = 'search_term_string';
		let action = new SearchAction();

		action.target = config.site.url + '/search?q={' + placeHolder + '}';
		action.queryInput = 'required name=' + placeHolder;

		return action;
	}

	/**
	 * Google prefers the logo be a simple URL rather than Image Object
	 * @return {Blog.LinkData.Organization}
	 */
	static organization() {
		let ld = new Organization();

		ld.name = config.site.title;
		ld.logo = LinkDataFactory.siteLogo();

		return ld;
	}

	/**
	 * @alias TI.LinkData.Factory.owner
	 * @returns {Blog.LinkData.Person}
	 */
	static owner() {
		let a = new Person();

		a.name = config.owner.name;
		a.url = config.site.url + '/about';
		a.sameAs = config.owner.urls;
		a.mainEntityOfPage = LinkDataFactory.webPage('about');
		a.image = LinkDataFactory.ownerImage();

		return a;
	}
}

module.exports = LinkDataFactory;