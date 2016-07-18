'use strict';

const { is } = require('../');
const Schema = require('./');

module.exports = {
   // https://developers.google.com/structured-data/testing-tool/
   // https://developers.google.com/structured-data/rich-snippets/articles
   fromPost(post) {
      let ld = new Schema.BlogPost();
      let postTagTitle = [];

      for (let slug in post.tags) { postTagTitle.push(post.tags[slug]); }

      ld.author = Factory.owner();
      ld.name = post.title;
      ld.headline = post.title;
      ld.description = post.description;
      ld.image = Factory.fromPhotoSize(post.coverPhoto.size.normal);
      ld.publisher = Factory.organization();
      ld.mainEntityOfPage = Factory.webPage(post.slug);
      ld.datePublished = post.dateTaken;
      ld.dateModified = post.updatedOn;
      ld.articleSection = postTagTitle.join(',');
      // implement video when full source data is ready
      // ld.video = Factory.fromVideo(post.video);

      //if (is.empty(post.photoTagList)) {
      //	content.keywords = config.keywords;
      //} else {
      //	content.keywords = config.alwaysKeywords + post.photoTagList;
      //}

      if (is.value(post.coverPhoto.size.thumb)) {
         ld.image.thumbnail = Factory.fromPhotoSize(post.coverPhoto.size.thumb);
      }

      return ld;
   }
};


/**
 * @alias Schema.Factory
 * @see https://developers.google.com/structured-data/testing-tool/
 */
class Factory {


	/**
	 * @param {Blog.PostTag} tag
	 * @param {String} slug Full slug with category
	 * @param {Boolean} [homePage = false]
	 * @return {Schema.Blog|Schema.WebSite}
	 * @see https://developers.google.com/structured-data/breadcrumbs
	 */
	static fromPostTag(tag, slug, homePage) {
		if (homePage === undefined) { homePage = false; }
		let ld = null;
		let site = Factory.config.site;

		if (homePage) {
			ld = new Schema.Blog();
			ld.url = site.url;
			ld.name = site.title;
			ld.author = Factory.owner();
			ld.description = site.description;
			ld.mainEntityOfPage = Factory.webPage();
			ld.potentialAction = Factory.searchAction();
			ld.publisher = Factory.organization();
		} else {
			let position = 1;
			let library = Blog.Library.current;

			ld = Factory.webPage(slug);
			ld.name = tag.title;
			ld.publisher = Factory.organization();
			ld.addBreadcrumb(Factory.breadcrumb(site.url, 'Home', position++));

			if (tag.slug.includes('/')) {
				let rootSlug = tag.slug.split('/')[0];
				let rootTag = library.tagWithSlug(rootSlug);
				ld.addBreadcrumb(Factory.breadcrumb(site.url + '/' + rootTag.slug, rootTag.title, position++));
			}
			ld.addBreadcrumb(Factory.breadcrumb(site.url + '/' + tag.slug, tag.title, position));
		}
		return ld;
	}

	/**
	 * @param {Blog.PhotoSize} size
	 * @returns {Schema.Image}
	 */
	static fromPhotoSize(size) {
		return Schema.Image.fromURL(size.url, size.width, size.height);
	}

	/**
	 *
	 * @param {String} url
	 * @param {String} title
	 * @param {Number} [position]
	 * @return {Schema.ListItem}
	 */
	static breadcrumb(url, title, position) {
		let ld = new Schema.ListItem();

		ld.item.id = url;
		ld.item.name = title;
		if (position !== undefined) { ld.position = position; }

		return ld;
	}

	/**
	 * @returns {Schema.Image}
	 */
	static siteLogo() {
		let img = Factory.config.site.logo;
		return Schema.Image.fromURL(img.url, img.width, img.height);
	}

	/**
	 * @returns {Schema.Image}
	 */
	static ownerImage() {
		let img = Factory.config.owner.image;
		return Schema.Image.fromURL(img.url, img.width, img.height);
	}

	/**
	 * @param {Blog.Video} v
	 * @returns {Schema.Video}
	 */
	static fromVideo(v) {
		if (v !== null && !v.empty) {
			let ld = new Schema.Video();

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
	 * @return {Schema.WebPage}
	 */
	static webPage(path) {
		if (is.empty(path)) { path = ''; }
		let ld = new Schema.WebPage();
		ld.id = Factory.pathURL(path);
		return ld;
	}

	/**
	 * @param {String} path
	 * @returns {String}
	 */
	static pathURL(path) { return Factory.config.site.url + '/' + path; }

	/**
	 * @returns {Schema.SearchAction}
	 * @see http://schema.org/docs/actions.html
	 */
	static searchAction() {
		const placeHolder = 'search_term_string';
		let action = new Schema.SearchAction();

		action.target = Factory.config.site.url + '/search?q={' + placeHolder + '}';
		action.queryInput = 'required name=' + placeHolder;

		return action;
	}

	/**
	 * Google prefers the logo be a simple URL rather than Image Object
	 * @return {Schema.Organization}
	 */
	static organization() {
		let ld = new Schema.Organization();

		ld.name = Factory.config.site.title;
		ld.logo = Factory.siteLogo();

		return ld;
	}

	/**
	 * @alias TI.LinkData.Factory.owner
	 * @returns {Schema.Person}
	 */
	static owner() {
		let a = new Schema.Person();
		let owner = Factory.config.owner;

		a.name = owner.name;
		a.url = Factory.config.site.url + '/about';
		a.sameAs = owner.urls;
		a.mainEntityOfPage = Factory.webPage('about');
		a.image = Factory.ownerImage();

		return a;
	}
}

Factory.config = {
	owner: {
		/**
		 * @type String
		 */
		name: null,
		/**
		 * @type String[]
		 */
		urls: null,
		/**
		 * @type {{url:String, width:Number, height:Number}}
		 */
		image: null
	},
	site: {
		/** @type String */
		title: null,
		/** @type String */
		url: null,
		/** @type String */
		description: null,
		/**
		 * @type {{url:String, width:Number, height:Number}}
		 */
		logo: null
	}
};

module.exports = Factory;