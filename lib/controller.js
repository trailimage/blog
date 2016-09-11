'use strict';

const is = require('./is');
const ld = require('./json-ld');
const log = require('./logger');
const config = require('./config');
const format = require('./format');
const template = require('./template');
const library = require('./library');
const C = require('./constants');
// route placeholders
const ph = C.route;

//region Map

/**
 * Map screen loads then makes AJAX call to fetch data
 * @param {Post} post
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function mapView(post, req, res) {
   if (post !== null) {
      let slug = post.isPartial ? post.seriesKey : post.key;

      res.render(template.page.map, {
         layout: template.layout.NONE,
         title: 'Map',
         post: post,
         slug: slug,
         photoID: req.params['photoID'] || 0,
         config: config
      });
   } else {
      res.notFound();
   }
}

function mapForPost(req, res) {
   mapView(library.postWithKey(req.params['slug']), req, res);
}

function mapForSeries(req, res) {
   mapView(library.postWithKey(req.params['groupSlug'], req.params['partSlug']), req, res);
}

/**
 * Compressed GeoJSON as zipped byte array in CacheItem
 * @param {BlogRequest} req
 * @param res
 */
function mapJSON(req, res) {
   db.file.loadMap(req.params['slug'], item => {
      if (item != null) {
         res.sendCompressed(C.mimeType.JSON, item, false);
      } else {
         res.notFound();
      }
   });
}

function mapGPX(req, res) {
   let post = config.map.allowDownload ? library.postWithKey(req.params['slug']) : null;

   if (post !== null) {
      db.file.loadGPX(post, res);
   } else {
      res.notFound();
   }
}

//endregion
//region Post

/**
 * @param res
 * @param {String} key Post key
 * @param {String} [pageTemplate]
 */
function postView(res, key, pageTemplate = template.page.POST) {
   res.sendView(key, render => {
      let p = library.postWithKey(key);
      if (p === null) { res.notFound(); return; }
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
   let postID = req.params['postID'];
   let post = library.postWithID(postID);

   if (post !== null) {
      res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.slug);
   } else {
      res.notFound();
   }
}
/**
 * Show newest post on home page
 */
function latestPost(req, res) { postView(res, library.posts[0].slug); }

//endregion
//region Photos

/**
 * Small HTML table of EXIF values for given photo
 */
function exif(req, res) {
   library.getEXIF(req.params['photoID']).then(exif => {
      res.render(template.page.EXIF, { EXIF: exif, layout: template.layout.NONE });
   });
}

/**
 * Show post with given photo ID
 */
function postWithPhoto(req, res) {
   let photoID = req.params['photoID'];

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
   let slug = decodeURIComponent(req.params['tagSlug']);

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
   let selected = decodeURIComponent(req.params['tagSlug']);
   const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
   let list = library.tags;
   let keys = Object.keys(list);
   let tags = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor((Math.random() * keys.length) + 1)];
   }

   // group tags by first letter (character)
   for (let c of alphabet) { tags[c] = {}; }
   for (let key in list) {
      let c = key.substr(0, 1).toLowerCase();
      if (alphabet.indexOf(c) >= 0)  { tags[c][key] = list[key]; }
   }

   res.render(template.page.PHOTO_TAG, {
      tags,
      selected,
      alphabet,
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
            const ld = ld.fromCategory(category, path, homePage);
            const count = category.posts.length;
            const options = { posts: category.posts };
            const subtitle = config.site.postAlias + ((count > 1) ? 's' : '');
            renderCategory(render, template.page.POST_TAG, tag, ld, options, count, subtitle);
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
      if (subcategory !== null) { count = subcategory.posts.length; }
      year--;
   }
   categoryView(res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories
 */
function categoryRoot(req, res) {
   let key = req.params[ph.ROOT_CATEGORY];

   if (is.value(key)) {
      res.sendView(key, render => {
         // use renderer to build view that wasn't cached
         let category = library.categoryWithKey(key);

         if (is.value(category)) {
            let ld = ld.fromCategory(category);
            let count = category.subcategories.length;
            let options = { tags: category.tags };

            renderCategory(render, template.page.POST_TAG_CATEGORY, category, ld, options, count, config.site.postTagAlias);
         } else {
            res.notFound();
         }
      });
   } else {
      res.notFound();
   }
};

function categoryMenu(req, res) => {
   const t = template.page.CATEGORY_MENU;
   res.sendView(t, render => { render(t, { library: library, layout: template.layout.NONE }); });
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
      headerCSS: config.style.css.postTagHeader,
      subtitle: format.sayNumber(childCount) + ' ' + subtitle
   }));
}

//endregion
//region Menu

// https://npmjs.org/package/uglify-js
const uglify = require('uglify-js');

function menuData(req, res)  {
   const slug = template.page.POST_MENU_DATA;
   res.setHeader('Vary', 'Accept-Encoding');
   res.sendView(slug, C.mimeType.JSONP, render => {
      render(
         slug,
         { library: library, layout: template.layout.NONE },
         // post-process rendered output
         text => uglify.minify(text, { fromString: true }).code);
   });
}

/**
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function mobileMenu(req, res) {
   let slug = template.page.MOBILE_MENU_DATA;
   res.sendView(slug, render => {
      render(slug, { library: library, layout: template.layout.NONE });
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
   const google = require('./google-drive');
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
   res.set("Cache-Control", "no-cache, no-store, must-revalidate");
   res.set("Pragma", "no-cache");
   res.set("Expires", 0);
   res.render(template.page.ADMINISTRATION, {
      logs,
      layout: template.layout.NONE,
      maps: is.array(mapKeys) ? mapKeys.sort() : null,
      views: is.array(viewKeys) ? viewKeys.sort() : null,
      models: is.array(jsonKeys) ? jsonKeys.sort() : null,
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
 * Reload library from photo provider, usually to find new posts
 * @returns {Promise.<String[]>}
 */
function reloadLibrary(callback) {
   return library.reload().then(changedPostKeys => {
      let keys = changedSlugs;

      if (changedSlugs.length > 0) {
         keys = changedSlugs.concat(menuKeys());
         // remove cached views that are built directly from library
         res.removeFromCache(keys);
      }
      keys.sort();
      callback(keys);
   });
}

/**
 * Reload photo tags
 * @param {function(String[])} callback Send list of affected keys
 */
function reloadPhotoTags(callback) {
   db.photo.reloadPhotoTags(() => { callback([ModelCache.tagsKey]); });
}

/**
 * Send standard JSON response to AJAX request
 * @param res
 * @param {Boolean} success
 * @param {String} [message]
 */
function jsonView(res, success, message) { res.json({ success, message }); }

//endregion
//region Cache

const cache = require('./cache');

/**
 * Cache keys for site map and menu views
 * @returns {String[]}
 */
function menuKeys() {
   return [
      template.page.MOBILE_MENU_DATA,
      template.page.POST_MENU_DATA,
      template.page.CATEGORY_MENU,
      template.page.SITEMAP
   ];
}

/**
 * Delete view cache item and all related tags
 */
function deleteViewCache(req, res) {
   // cache keys to be invalidated
   let keys = menuKeys();

   for (let slug of req.body.selected) {
      let p = library.postWithKey(slug);

      keys.push(slug);

      if (p !== null) {
         // retrieve post related tags
         keys = keys.concat(library.categoryKeys(p.tags));
         // also refresh adjacent views
         if (p.next !== null) { keys.push(p.next.slug); }
         if (p.previous !== null) { keys.push(p.previous.slug); }
      }
   }

   res.removeFromCache(keys)
      .then(() => {
         // remove in-memory post cache from library singleton
         library.unload(keys);
         keys.sort();
         jsonView(res, true, keys.join());
      })
      .catch(err => {
         jsonView(res, false, err);
      })
}

/**
 * Delete map cache and update post flag to force reload
 */
function deleteMapCache(req, res) => {
   let slugs = req.body.selected;

   cache.map.remove(slugs)
      .then(() => {
         for (let s of slugs) {
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
         slugs.sort();
         jsonView(res, true, slugs.join());
      })
      .catch(err => {
         jsonView(res, false, err);
      });
}

function deleteJsonCache(req, res) {
   let model = req.body.selected;
   let respond = keys => { jsonView(res, true, keys.join()); };

   switch (ModelCache.keyPrefix + model) {
      case ModelCache.postsKey:
         reloadLibrary(respond);
         break;
      case ModelCache.tagsKey:
         reloadPhotoTags(respond);
         break;
      default:
         jsonView(res, false);
   }
}

//endregion
//region PDF

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
function pdfView(req, res) => {
   let post = library.postWithKey(req.params['slug']);

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
      category: null
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
      root: categoryRoot
   },

   admin: {
      home: adminHome
   },

   cache: {
      deleteView: deleteViewCache,
      deleteMap: deleteMapCache,
      deleteJSON: deleteJsonCache
   }
};