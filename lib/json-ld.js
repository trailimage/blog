'use strict';

const is = require('./is');
const config = require('./config');
const library = require('./library');
const contextField = '@context';
const typeField = '@type';
const idField = '@id';

/**
 * Add standard Linked Data fields
 * @param {String} type
 * @param {Object} [fields]
 * @returns {*}
 */
function ld(type, fields = {}) {
   if (fields['id'] !== undefined) {
      // rename ID field to standard
      fields[idField] = fields['id'];
      delete fields['id'];
   }
   fields[typeField] = type;
   fields[contextField] = 'http://schema.org';
   return fields;
}

// http://schema.org/ImageObject
function image(img) {
   const schema = { url: img.url };
   if (img.width !== undefined) { schema.width = img.width; }
   if (img.height !== undefined) { schema.height = img.height; }
   return ld('Image', schema);
}

// http://schema.org/WebPage
function webPage(path = '') { return ld('WebPage', { id: pathUrl(path) }); }

const pathUrl = () => config.site.url + '/' + path;

// http://schema.org/Organization
function organization() {
   return ld('Organization', {
      name: config.site.title,
      logo: image(config.site.logo)
   });
}

// http://schema.org/Person
function owner() {
   return ld('Person', {
      name: config.owner.name,
      url: config.site.url + '/about',
      sameAs: config.owner.urls,
      mainEntityOfPage: webPage('about'),
      image: image(config.owner.image)
   });
}

// http://schema.org/Breadcrumb
function breadcrumb(url, title, position) {
   const schema = { item: { id: url, name: title } };
   if (!isNaN(position)) { schema.position = position; }
   return ld('BreadcrumbList', schema);
}

// http://schema.org/docs/actions.html
// http://schema.org/SearchAction
// https://developers.google.com/structured-data/slsb-overview
function searchAction() {
   const qi = 'query-input';
   const placeHolder = 'search_term_string';

   return ld('SearchAction', {
      target: config.site.url + '/search?q={' + placeHolder + '}',
      [qi]: 'required name=' + placeHolder
   });
}


module.exports = {
   // https://developers.google.com/structured-data/testing-tool/
   // https://developers.google.com/structured-data/rich-snippets/articles
   fromPost(post) {
      let postTagTitle = [];
      for (let slug in post.tags) { postTagTitle.push(post.tags[slug]); }
      let schema = {
         author: owner(),
         name: post.title,
         headline: post.title,
         description: post.description,
         image: image(post.coverPhoto.size.normal),
         publisher: organization(),
         mainEntityOfPage: webPage(post.slug),
         datePublished: post.dateTaken,
         dateModified: post.updatedOn,
         articleSection: postTagTitle.join(',')
      };


      // implement video when full source data is ready
      // ld.video = Factory.fromVideo(post.video);

      //if (is.empty(post.photoTagList)) {
      //	content.keywords = config.keywords;
      //} else {
      //	content.keywords = config.alwaysKeywords + post.photoTagList;
      //}

      if (is.value(post.coverPhoto.size.thumb)) {
         schema.image.thumbnail = image(post.coverPhoto.size.thumb);
      }

      return ld('', schema);
   },

   // https://developers.google.com/structured-data/breadcrumbs
   fromPostTag(tag, slug, homePage) {
      if (homePage === undefined) { homePage = false; }

      if (homePage) {
         return ld('Blog', {
            url: config.site.url,
            name: config.site.title,
            author: owner(),
            description: config.site.description,
            mainEntityOfPage: webPage(),
            potentialAction: searchAction(),
            publisher: organization()
         });
      } else {
         const schema = webPage(slug);
         let position = 1;

         schema.name = tag.title;
         schema.publisher = organization();
         schema.breadcrumb = [breadcrumb(config.site.url, 'Home', position++)];

         if (tag.slug.includes('/')) {
            let rootSlug = tag.slug.split('/')[0];
            let rootTag = library.categoryWithSlug(rootSlug);
            schema.breadcrumb.push(breadcrumb(config.site.url + '/' + rootTag.slug, rootTag.title, position++));
         }
         schema.breadcrumb.push(breadcrumb(config.site.url + '/' + tag.slug, tag.title, position));
      }
   },

   // http://schema.org/VideoObject
   fromVideo(v) {
      return (v == null || v.empty) ? null : ld('VideoObject', {
         contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
         videoFrameSize: v.width + 'x' + v.height,
         description: null,
         uploadDate: null,
         thumbnailUrl: null
      });
   }
};