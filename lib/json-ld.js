const is = require('./is');
const config = require('./config');
const library = require('./library');
const defaultContext = 'http://schema.org';
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
   if (is.defined(fields, 'id')) {
      // rename ID field to standard
      fields[idField] = fields['id'];
      delete fields['id'];
   }
   fields[typeField] = type;
   fields[contextField] = defaultContext;
   return fields;
}

//region Schemas

/**
 * @param {Size|Object} img
 * @returns {JsonLD.ImageObject}
 * @see http://schema.org/ImageObject
 */
function image(img) {
   const schema = { url: img.url };
   if (is.defined(img, 'width')) { schema.width = img.width; }
   if (is.defined(img, 'height')) { schema.height = img.height; }
   return ld('ImageObject', schema);
}

/**
 * @param {String} path
 * @returns {JsonLD.WebPage}
 * @see http://schema.org/WebPage
 */
function webPage(path = '') { return ld('WebPage', { id: pathUrl(path) }); }

const pathUrl = path => config.site.url + '/' + path;

/**
 * @returns {JsonLD.Organization}
 * @see http://schema.org/Organization
 */
function organization() {
   return ld('Organization', {
      name: config.site.title,
      logo: image(config.site.logo)
   });
}

/**
 * @returns {JsonLD.Person}
 * @see http://schema.org/Person
 */
function owner() {
   return ld('Person', {
      name: config.owner.name,
      url: config.site.url + '/about',
      sameAs: config.owner.urls,
      mainEntityOfPage: webPage('about'),
      image: image(config.owner.image)
   });
}

/**
 * @param {String} url
 * @param {String} title
 * @param {Number} position
 * @returns {JsonLD.BreadcrumbList}
 * @see http://schema.org/Breadcrumb
 */
function breadcrumb(url, title, position) {
   const schema = { item: { id: url, name: title } };
   if (!isNaN(position)) { schema.position = position; }
   return ld('BreadcrumbList', schema);
}

/**
 * @returns {JsonLD.SearchAction}
 * @see http://schema.org/docs/actions.html
 * @see http://schema.org/SearchAction
 * @see https://developers.google.com/structured-data/slsb-overview
 */
function searchAction() {
   const qi = 'query-input';
   const placeHolder = 'search_term_string';

   return ld('SearchAction', {
      target: config.site.url + '/search?q={' + placeHolder + '}',
      [qi]: 'required name=' + placeHolder
   });
}

//endregion
//region Serialization

/**
 * Convert link data to string with nulls and zeroes removed
 * @param {Object} linkData
 * @return {String}
 */
function serialize(linkData) {
   removeContext(linkData);
   return JSON.stringify(linkData, (key, value) => (value === null || value === 0) ? undefined : value);
}

/**
 * Remove redundant context specifications
 * @param {Object} linkData
 * @param {String} [context] Current schema context
 */
function removeContext(linkData, context = null) {
   if (linkData !== undefined && linkData !== null && typeof(linkData) == is.type.OBJECT) {
      if (linkData.hasOwnProperty(contextField) && linkData[contextField] !== null) {
         if (context !== null && linkData[contextField] == context) {
            // remove redundant value
            delete linkData[contextField];
         } else {
            // switch to new context
            context = linkData[contextField];
         }
      }
      for (const field in linkData) { removeContext(linkData[field], context); }
   }
}

//endregion

module.exports = {
   contextField,
   typeField,
   idField,
   /**
    * @param {Post} post
    * @returns {Object}
    * @see https://developers.google.com/structured-data/testing-tool/
    * @see https://developers.google.com/structured-data/rich-snippets/articles
    */
   fromPost(post) {
      const categoryTitle = Object
         .keys(post.categories)
         .map(key => post.categories[key]);
      const schema = {
         author: owner(),
         name: post.title,
         headline: post.title,
         description: post.description,
         image: image(post.coverPhoto.size.normal),
         publisher: organization(),
         mainEntityOfPage: webPage(post.key),
         datePublished: post.dateTaken,
         dateModified: post.updatedOn,
         articleSection: categoryTitle.join(',')
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

   /**
    * @param {Category} category
    * @param {String} [key] path or slug
    * @param {Boolean} [homePage]
    * @returns {JsonLD.Blog|JsonLD.WebPage}
    * @see https://developers.google.com/structured-data/breadcrumbs
    */
   fromCategory(category, key = category.key, homePage = false) {
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
         const schema = webPage(key);
         let position = 1;

         schema.name = category.title;
         schema.publisher = organization();
         schema.breadcrumb = [breadcrumb(config.site.url, 'Home', position++)];

         if (category.key.includes('/')) {
            // implies category is a subscategory
            const rootKey = category.key.split('/')[0];
            const rootCategory = library.categoryWithKey(rootKey);
            schema.breadcrumb.push(breadcrumb(config.site.url + '/' + rootCategory.key, rootCategory.title, position++));
         }
         schema.breadcrumb.push(breadcrumb(config.site.url + '/' + category.key, category.title, position));
         return schema;
      }
   },

   /**
    * @param {Object} v
    * @returns {JsonLD.VideoObject}
    * @see http://schema.org/VideoObject
    */
   fromVideo(v) {
      return (v == null || v.empty) ? null : ld('VideoObject', {
         contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
         videoFrameSize: v.width + 'x' + v.height,
         description: null,
         uploadDate: null,
         thumbnailUrl: null
      });
   },
   serialize
};