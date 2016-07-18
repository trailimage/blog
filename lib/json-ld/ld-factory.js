'use strict';

const { is } = require('../');
const { blog, blogPost, image, listItem, video,
        webPage, organization, person, searchAction } = require('./');

module.exports = {
   config: {
      owner: {
         name: null,
         urls: null,
         image: null
      },
      site: {
         title: null,
         url: null,
         description: null,
         logo: null
      }
   },

   // https://developers.google.com/structured-data/testing-tool/
   // https://developers.google.com/structured-data/rich-snippets/articles
   fromPost(post) {
      let ld = blogPost.copy();
      let postTagTitle = [];

      for (let slug in post.tags) { postTagTitle.push(post.tags[slug]); }

      ld.author = this.owner();
      ld.name = post.title;
      ld.headline = post.title;
      ld.description = post.description;
      ld.image = this.fromPhotoSize(post.coverPhoto.size.normal);
      ld.publisher = this.organization();
      ld.mainEntityOfPage = this.webPage(post.slug);
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
         ld.image.thumbnail = this.fromPhotoSize(post.coverPhoto.size.thumb);
      }

      return ld;
   },

   // https://developers.google.com/structured-data/breadcrumbs
   fromPostTag(tag, slug, homePage) {
      if (homePage === undefined) { homePage = false; }
      let ld = null;
      let site = this.config.site;

      if (homePage) {
         ld = blog.copy();
         ld.url = site.url;
         ld.name = site.title;
         ld.author = this.owner();
         ld.description = site.description;
         ld.mainEntityOfPage = this.webPage();
         ld.potentialAction = this.searchAction();
         ld.publisher = this.organization();
      } else {
         let position = 1;
         let library = Blog.Library.current;

         ld = this.webPage(slug);
         ld.name = tag.title;
         ld.publisher = this.organization();
         ld.addBreadcrumb(this.breadcrumb(site.url, 'Home', position++));

         if (tag.slug.includes('/')) {
            let rootSlug = tag.slug.split('/')[0];
            let rootTag = library.tagWithSlug(rootSlug);
            ld.addBreadcrumb(this.breadcrumb(site.url + '/' + rootTag.slug, rootTag.title, position++));
         }
         ld.addBreadcrumb(this.breadcrumb(site.url + '/' + tag.slug, tag.title, position));
      }
      return ld;
   },

   fromPhotoSize(size) {
      return image.fromURL(size.url, size.width, size.height);
   },

   breadcrumb(url, title, position) {
      let ld = listItem.copy();

      ld.item.id = url;
      ld.item.name = title;
      if (position !== undefined) { ld.position = position; }

      return ld;
   },

   siteLogo() {
      let img = this.config.site.logo;
      return image.fromURL(img.url, img.width, img.height);
   },

   ownerImage() {
      let img = this.config.owner.image;
      return image.fromURL(img.url, img.width, img.height);
   },

   fromVideo(v) {
      if (v !== null && !v.empty) {
         let ld = video.copy();

         ld.contentUrl = 'https://www.youtube.com/watch?v=' + v.id;
         ld.videoFrameSize = v.width + 'x' + v.height;
         ld.description = null;
         ld.uploadDate = null;
         ld.thumbnailUrl = null;

         return ld;
      } else {
         return null;
      }
   },

   webPage(path) {
      if (is.empty(path)) { path = ''; }
      let ld = webPage.copy();
      ld.id = this.pathURL(path);
      return ld;
   },

   pathURL(path) { return this.config.site.url + '/' + path; },

   // http://schema.org/docs/actions.html
   searchAction() {
      const placeHolder = 'search_term_string';
      let action = searchAction.copy();

      action.target = this.config.site.url + '/search?q={' + placeHolder + '}';
      action.queryInput = 'required name=' + placeHolder;

      return action;
   },

   organization() {
      let ld = organization.copy();

      ld.name = this.config.site.title;
      ld.logo = this.siteLogo();

      return ld;
   },

   owner() {
      let a = person.copy();
      let owner = this.config.owner;

      a.name = owner.name;
      a.url = this.config.site.url + '/about';
      a.sameAs = owner.urls;
      a.mainEntityOfPage = this.webPage('about');
      a.image = this.ownerImage();

      return a;
   }
};