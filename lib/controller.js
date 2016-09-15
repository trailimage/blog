'use strict';

//region Imports

const is = require('./is');
const ld = require('./json-ld');
const log = require('./logger');
const cache = require('./cache');
const config = require('./config');
const format = require('./format');
const template = require('./template');
const library = require('./library');
const C = require('./constants');
// route placeholders
const ph = C.route;

//endregion
//region Map

const google = require('./google');

/**
 * Map screen loads then makes AJAX call to fetch data
 * @param {Post} post
 * @param req
 * @param res
 */
function mapView(post, req, res) {
   if (is.value(post)) {
      const slug = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[ph.PHOTO_ID];

      res.render(template.page.MAP, {
         layout: template.layout.NONE,
         title: 'Map',
         post,
         slug,
         photoID: is.numeric(photoID) ? photoID : 0,
         config
      });
   } else {
      res.notFound();
   }
}

function mapForPost(req, res) {
   mapView(library.postWithKey(req.params[ph.POST_KEY]), req, res);
}

function mapForSeries(req, res) {
   mapView(library.postWithKey(req.params[ph.SERIES_KEY], req.params[ph.PART_KEY]), req, res);
}

/**
 * Compressed GeoJSON as zipped byte array in CacheItem
 * @param req
 * @param res
 */
function mapJSON(req, res) {
   cache.map.item(req.params[ph.POST_KEY])
      .then(item => {
         if (is.value(item)) {
            return item;
         } else {
            return google.map.
         }

      })
      .then(item => {

      });
}

function mapGPX(req, res) {
   let post = config.map.allowDownload ? library.postWithKey(req.params[ph.POST_KEY]) : null;

   if (post !== null) {
      db.file.loadGPX(post, res);
   } else {
      res.notFound();
   }
}

//endregion
//region Post

/**
 * @param {BlogResponse} res
 * @param {String} key Post key
 * @param {String} [pageTemplate]
 */
function postView(res, key, pageTemplate = template.page.POST) {
   res.sendView(key, render => {
      let p = library.postWithKey(key);
      if (!is.value(p)) { res.notFound(); return; }
      p.getPhotos()
         .then(() => {
            render(pageTemplate, {
               post: p,
               title: p.title,
               // https://developers.google.com/structured-data/testing-tool/
               jsonLD: ld.serialize(ld.fromPost(p)),
               description: p.longDescription,
               slug: key,
               layout: template.layout.NONE
            });
         })
         .catch(res.internalError)
   });
}

/**
 * Display post that's part of a series
 */
function postInSeries(req, res) {
   postView(res, req.params[ph.SERIES_KEY] + '/' + req.params[ph.PART_KEY]);
}
function postWithKey(req, res) {
   postView(res, req.params[ph.POST_KEY]);
}

/**
 * Post with given Flickr ID
 * Redirect to normal URL
 */
function postWithID(req, res) {
   const post = library.postWithID(req.params[ph.POST_ID]);

   if (is.value(post)) {
      res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.key);
   } else {
      res.notFound();
   }
}
/**
 * Show newest post on home page
 */
function latestPost(req, res) { postView(res, library.posts[0].key); }

//endregion
//region Photos

/**
 * Small HTML table of EXIF values for given photo
 */
function exif(req, res) {
   library.getEXIF(req.params[ph.PHOTO_ID]).then(exif => {
      res.render(template.page.EXIF, { EXIF: exif, layout: template.layout.NONE });
   });
}

/**
 * Show post with given photo ID
 */
function postWithPhoto(req, res) {
   let photoID = req.params[ph.PHOTO_ID];

   library.getPostWithPhoto(photoID).then(post => {
      if (is.value(post)) {
         res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.key + '#' + photoID);
      } else {
         res.notFound();
      }
   });
}

/**
 * Photos with tag
 */
function photosWithTag(req, res) {
   let slug = decodeURIComponent(req.params[ph.PHOTO_TAG]);

   library.getPhotosWithTags(slug).then(photos => {
      if (photos === null || photos.length == 0) {
         res.notFound();
      } else {
         let tag = library.tags[slug];
         let title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

         res.render(template.page.PHOTO_SEARCH, {
            photos,
            config,
            title,
            layout: template.layout.NONE
         });
      }
   });
}

function tags(req, res) {
   let selected = decodeURIComponent(req.params[ph.PHOTO_TAG]);
   let list = library.tags;
   let keys = Object.keys(list);
   let tags = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor((Math.random() * keys.length) + 1)];
   }

   // group tags by first letter (character)
   for (let c of C.alphabet) { tags[c] = {}; }
   for (let key in list) {
      let c = key.substr(0, 1).toLowerCase();
      if (C.alphabet.indexOf(c) >= 0)  { tags[c][key] = list[key]; }
   }

   res.render(template.page.PHOTO_TAG, {
      tags,
      selected,
      alphabet: C.alphabet,
      title: keys.length + ' Photo Tags',
      config
   });
}

//endregion
//region Category

/**
 * @param res
 * @param {String} path
 * @param {Boolean} [homePage = false]
 */
function categoryView(res, path, homePage) {
   res.sendView(path, render => {
      // use renderer to build view that wasn't cached
      let category = library.categoryWithKey(path);

      if (is.value(category)) {
         category.ensureLoaded().then(()=> {
            const linkData = ld.fromCategory(category, path, homePage);
            const count = category.posts.length;
            const options = { posts: category.posts };
            const subtitle = config.site.postAlias + ((count > 1) ? 's' : '');

            renderCategory(render, template.page.CATEGORY, category, linkData, options, count, subtitle);
         });
      } else {
         res.notFound();
      }
   });
}


/**
 * A particular category like When/2013
 */
function categoryForPath(req, res) {
   categoryView(res, req.params[ph.ROOT_CATEGORY] + '/' + req.params[ph.CATEGORY]);
}

/**
 * "Home" page shows latest default category that contains posts
 * This is still messed up from a configurability perspective since it assumes
 * the default tag has years as child tags
 * @param req
 * @param res
 */
function categoryHome(req, res) {
   const category = library.categories[config.library.defaultCategory];
   let year = (new Date()).getFullYear();
   let subcategory = null;
   let count = 0;

   while (count == 0) {
      // step backwards until a year with posts is found
      subcategory = category.getSubcategory(year.toString());
      if (is.value(subcategory)) { count = subcategory.posts.length; }
      year--;
   }
   categoryView(res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories
 */
function categoryList(req, res) {
   let key = req.params[ph.ROOT_CATEGORY];

   if (is.value(key)) {
      res.sendView(key, render => {
         // use renderer to build view that wasn't cached
         let category = library.categoryWithKey(key);

         if (is.value(category)) {
            let linkData = ld.fromCategory(category);
            let count = category.subcategories.length;
            let options = { subcategories: category.subcategories };
            let subtitle = 'Subcategories';

            renderCategory(render, template.page.CATEGORY_LIST, category, linkData, options, count, subtitle);
         } else {
            res.notFound();
         }
      });
   } else {
      res.notFound();
   }
}

function categoryMenu(req, res) {
   const t = template.page.CATEGORY_MENU;
   res.sendView(t, render => { render(t, { library, layout: template.layout.NONE }); });
}

/**
 * Render category if it wasn't cached
 * @param {function} render
 * @param {String} template Name of template
 * @param {Category} category
 * @param {Object} linkData
 * @param {Object} options
 * @param {Number} childCount
 * @param {String} subtitle
 */
function renderCategory(render, template, category, linkData, options, childCount, subtitle) {
   render(template, Object.assign(options, {
      title: category.title,
      jsonLD: ld.serialize(linkData),
      headerCSS: config.style.css.categoryHeader,
      subtitle: format.sayNumber(childCount) + ' ' + subtitle
   }));
}

//endregion
//region Menu

// https://npmjs.org/package/uglify-js
const uglify = require('uglify-js');

function menuData(req, res)  {
   const slug = template.page.POST_MENU_DATA;
   // minify menu JSON for live site
   const postProcess = config.isProduction
      ? text => uglify.minify(text, { fromString: true }).code
      : null;
   res.setHeader('Vary', 'Accept-Encoding');
   res.sendView(slug, C.mimeType.JSONP, render => {
      render(slug, { library, layout: template.layout.NONE }, postProcess);
   });
}

/**
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function mobileMenu(req, res) {
   let slug = template.page.MOBILE_MENU_DATA;
   res.sendView(slug, render => {
      render(slug, { library, layout: template.layout.NONE });
   });
}

//endregion
//region Authentication

/**
 * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
function authView(req, res) {
   if (db.needsAuth) {
      if (db.photo.needsAuth) {

      } else if (db.file.needsAuth) {
         res.redirect(db.file.authorizationURL);
      }
   } else {
      // we shouldn't be here
   }
}

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
function flickrAuth(req, res) {
   const flickr = require('./flickr');

   if (is.empty(req.param('oauth_token'))) {
      log.warn('%s is updating Flickr tokens', req.clientIP());
      flickr.getRequestToken().then(url => res.redirect(url));
   } else {
      let token = req.param('oauth_token');
      let verifier = req.param('oauth_verifier');

      flickr.getAccessToken(token, verifier)
         .then(token => {
            res.render(template.page.AUTHORIZE, {
               title: 'Flickr Access',
               token: token.value,
               secret: token.secret,
               layout: template.layout.NONE
            });
         })
         .catch(err => {

         })
   }
}

/**
 * @see https://github.com/google/google-api-nodejs-client/
 */
function googleAuth(req, res) {
   const google = require('./google');
   const code = req.params('code');
   if (is.empty(code)) {
      log.ERROR('Cannot continue without Google authorization code');
      res.internalError();
   } else {
      google.getAccessToken(code, (accessToken, refreshToken, refreshTokenExpiration) => {
         // tokens includes access and optional refresh token
         res.render(template.page.AUTHORIZE, {
            title: 'Google Access',
            token: accessToken,
            secret: refreshToken,
            layout: template.layout.NONE
         });
      });
   }
}

//endregion
//region Administration

/**
 * @param res
 * @param {String[]} viewKeys
 * @param {String[]} jsonKeys
 * @param {String[]} mapKeys
 * @param {Object} [logs]
 */
function adminView(res, viewKeys, jsonKeys, mapKeys, logs) {
   res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
   });
   res.render(template.page.ADMINISTRATION, {
      logs,
      layout: template.layout.NONE,
      maps: is.array(mapKeys) ? mapKeys.sort() : null,
      views: is.array(viewKeys) ? viewKeys.sort() : null,
      json: is.array(jsonKeys) ? jsonKeys.sort() : null,
      library,
      config
   });
}

/**
 * Load all caches and logs
 */
function adminHome(req, res) {
   log.warnIcon(C.icon.eye, '%s viewing administration', req.clientIP());

   Promise.all([
      cache.keys(),
      cache.view.keys(),
      cache.map.keys(),
      log.query(7),
   ]).then(([jsonKeys, viewKeys, mapKeys, logs]) => {
      jsonKeys = (is.array(jsonKeys)) ? jsonKeys.map(j => j.remove(cache.prefix)) : [];
      adminView(res, viewKeys, jsonKeys, mapKeys, logs);
   });
}

/**
 * Delete library caches then update from photo provider, usually to find new posts
 */
function updateLibrary(req, res) {
   return cache.remove(flickr.cache.keysForLibrary).then(()=> library.load(false)
      .then(()=> {
         if (library.changedKeys.length > 0) {
            let changedKeys = library.changedKeys;
            // always refresh menus
            changedKeys = changedKeys.concat(menuKeys);
            changedKeys.sort();
            // remove cached views affected by the update
            cache.view.remove(changedKeys).then(res.jsonMessage);
         } else {
            res.jsonMessage([]);
         }
      }))
      .catch(res.jsonError);
}

//endregion
//region Cache

const flickr = require('./flickr');

/**
 * Cache keys for site map and menu views
 * @returns {String[]}
 */
const menuKeys = [
   template.page.MOBILE_MENU_DATA,
   template.page.POST_MENU_DATA,
   template.page.CATEGORY_MENU,
   template.page.SITEMAP
];

/**
 * Delete view and API caches for a post
 */
function deletePostCache(req, res) {
   // cache keys to be invalidated
   let viewKeys = menuKeys.slice();
   let apiHashKeys = [];

   for (let key of req.body.selected) {
      let p = library.postWithKey(key);

      viewKeys.push(key);

      if (p !== null) {
         // include post categories
         viewKeys = viewKeys.concat(Object.keys(p.categories));
         // API calls are keyed to provider ID
         apiHashKeys.push(p.id);
         // and adjacent views
         // (no need to invalidate API caches for these since post
         // correlation is not part of the API)
         if (p.next !== null) { viewKeys.push(p.next.key); }
         if (p.previous !== null) { viewKeys.push(p.previous.key); }
      }
   }

   Promise.all([
      // remove Flickr API responses
      cache.remove(flickr.cache.keysForPost, apiHashKeys),
      // remove rendered and compressed views
      cache.view.remove(viewKeys)
   ])
   .then(() => {
      // remove in-memory post cache from library singleton
      library.unload(viewKeys);
      viewKeys.sort();
      res.jsonMessage(viewKeys.join());
   })
   .catch(res.jsonError);
}

/**
 * Delete map cache and update post flag to force reload
 */
function deleteMapCache(req, res) {
   let keys = req.body.selected;

   cache.map.remove(keys)
      .then(() => {
         for (let s of keys) {
            // force track to be reloaded
            let p = library.postWithKey(s);
            if (is.value(p)) {
               p.triedTrack = false;

               while (p.nextIsPart) {
                  p = p.next;
                  p.triedTrack = false;
               }
            }
         }
         keys.sort();
         res.jsonMessage(keys.join());
      })
      .catch(res.jsonError);
}

//endregion
//region PDF

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
function pdfView(req, res) {
   let post = library.postWithKey(req.params[ph.POST_KEY]);

   if (post !== null) {
      db.photo.loadPost(post, post => {
         let book = new Book();
         let layout = new Layout();
         let pageNumber = 1;

         book.add(makeCover(post));
         book.add(makeCopyrightPage(post));

         for (let p of post.photos) {
            book.add(makePhotoPage(p, pageNumber++));
            //indexPage.addWord(p.tags, C);
         }

         layout.createDocument(post.title, post.author);
         layout.pdf.pipe(res);

         book.render(layout, ()=> { layout.pdf.end() });
      });
   } else {
      res.notFound();
   }
}

/**
 * @param {Post} post
 * @returns {TI.PDF.Page}
 */
function makeCover(post) {
   const Rectangle = TI.PDF.Element.Rectangle;
   let p = new Page('coverPage');

   p.pdfReady = true;
   p.addImage(post.coverPhoto.size.normal, 'coverImage');
   p.add(new Rectangle('coverOverlay'));
   p.addText(post.title, 'coverTitle');
   p.addText('photo essay by ' + post.author, 'coverByLine');
   p.addText(post.dateTaken, 'coverDate');
   p.addText(post.description, 'coverSummary');

   return p;
}

/**
 * @param {Post} post
 * @returns {TI.PDF.Page}
 */
function makeCopyrightPage(post) {
   let p = new Page('copyrightPage');
   let now = new Date();
   let year = now.getFullYear();

   p.addText('© Copyright ' + year + ' ' + post.author, 'copyrightText');
   p.addText(format.date(now) + ' Edition', 'editionText');

   return p;
}

/**
 * @param {Photo} photo
 * @param {Number} number
 * @returns {TI.PDF.Page}
 */
function makePhotoPage(photo, number) {
   const PhotoWell = TI.PDF.Element.PhotoWell;
   const PhotoCaption = TI.PDF.Element.Caption;
   let p = new Page('photoPage', number);
   let w = new PhotoWell();
   let c = new PhotoCaption(photo.description);

   w.addImage(photo.size.normal);
   w.addText(photo.title);

   if (w.image.isPortrait) {
      // image and caption are side-by-side
      w.style = 'photoWellLeft';
      c.style = 'captionRight';
   } else {
      // image and capton are stacked
      w.style = 'photoWellTop';
      c.style = 'captionBottom';
   }
   p.add(w);
   p.add(c);

   return p;
}

//endregion

module.exports = {
   search(req, res) {
      let term = req.query['q'];

      if (is.value(term)) {
         res.render(template.page.SEARCH, {
            title: 'Search for “' + req.query['q'] + '”',
            config: config
         });
      } else {
         res.notFound();
      }
   },

   about(req, res)  {
      res.sendView(template.page.ABOUT, {
         title: 'About ' + config.site.title,
         jsonLD: ld.serialize(ld.owner)
      });
   },

   siteMap(req, res) {
      res.sendView(template.page.SITEMAP, C.mimeType.XML, render => {
         render(template.page.SITEMAP, {
            posts: library.posts,
            categories: library.categoryKeys(),
            tags: library.tags,
            layout: null
         });
      });
   },

   issues(req, res) {
      res.redirect(C.httpStatus.PERMANENT_REDIRECT, 'http://issues.' + config.domain);
   },

   rss(req, res) {
      const Feed = require('feed');
      const MAX_RETRIES = 10;
      let retries = 0;

      if (!library.postInfoLoaded) {
         if (retries >= MAX_RETRIES) {
            log.error('Unable to load library after %d tries', MAX_RETRIES);
            res.render(C.httpStatus.NOT_FOUND, {'title': 'Unable to load feed'});
            // reset tries so page can be refreshed
            retries = 0;
         } else {
            retries++;
            log.error('Library not ready when creating RSS feed — attempt %d', retries);
            setTimeout(() => { exports.view(req, res); }, 3000);
         }
         return;
      }

      let author = { name: config.owner.name, link: 'https://www.facebook.com/jason.e.abbott' };
      let copyright = 'Copyright © ' + new Date().getFullYear() + ' ' + config.owner.name + '. All rights reserved.';
      let feed = new Feed({
         title: config.site.title,
         description: config.site.description,
         link: 'http://' + config.site.domain,
         image: 'http://' + config.site.domain + '/img/logo.png',
         copyright: copyright,
         author: author
      });

      for (let p of library.posts.filter(p => p.chronological)) {
         feed.addItem({
            image: p.bigThumbURL,
            author: author,
            copyright: copyright,
            title: p.title,
            link: config.site.url + '/' + p.slug,
            description: p.description,
            date: p.createdOn
         });
      }
      res.set('Content-Type', C.mimeType.XML);
      res.send(feed.render('rss-2.0'));
   },

   pdf: pdfView,

   post: {
      inSeries: postInSeries,
      view: postWithKey,
      home: latestPost,
      providerID: postWithID
   },

   map: {
      download: mapGPX,
      json: mapJSON,
      forPost: mapForPost,
      forSeries: mapForSeries
   },

   photo: {
      exif,
      inPost: postWithPhoto,
      withTag: photosWithTag,
      tags
   },

   menu: {
      data: menuData,
      mobile: mobileMenu,
      category: categoryMenu,
   },

   auth: {
      view: authView,
      flickr: flickrAuth,
      google: googleAuth
   },

   category: {
      home: categoryHome,
      view: categoryForPath,
      menu: categoryMenu,
      list: categoryList
   },

   admin: {
      home: adminHome,
      updateLibrary
   },

   cache: {
      deletePost: deletePostCache,
      deleteMap: deleteMapCache
   }
};