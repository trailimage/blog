const is = require('./is');
const ld = require('./json-ld');
const log = require('./logger');
const flickr = require('./flickr');
const cache = require('./cache');
const config = require('./config');
const util = require('./util');
const template = require('./template');
const factory = require('./factory');
const library = require('./library');
const C = require('./constants');
/**
 * Route placeholders
 */
const ph = C.route;

/**
 * Cache keys for site map and menu views
 * @returns {string[]}
 */
const menuKeys = [
   template.page.MOBILE_MENU_DATA,
   template.page.POST_MENU_DATA,
   template.page.CATEGORY_MENU,
   template.page.SITEMAP
];

//= Map =======================================================================

// can be replaced with injection
let google = require('./google');

/**
 * Map screen loads then makes AJAX call to fetch data
 * @param {Post} post
 * @param req
 * @param res
 */
function mapView(post, req, res) {
   if (is.value(post)) {
      const key = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[ph.PHOTO_ID];

      res.render(template.page.MAP, {
         layout: template.layout.NONE,
         title: 'Map',
         post,
         key,
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
 * Compressed GeoJSON as zipped byte array
 */
function mapJSON(req, res) {
   factory.map.forPost(req.params[ph.POST_KEY])
      .then(item => { res.sendCompressed(C.mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

function mapGPX(req, res) {
   const post = config.map.allowDownload ? library.postWithKey(req.params[ph.POST_KEY]) : null;

   if (is.value(post)) {
      google.drive.loadGPX(post, res)
         .then(()=> { res.end(); })
         // errors already logged by loadGPX()
         .catch(res.notFound);
   } else {
      res.notFound();
   }
}

//= Post ======================================================================

/**
 * @param {BlogResponse} res
 * @param {string} key Post key
 * @param {string} [pageTemplate]
 */
function postView(res, key, pageTemplate = template.page.POST) {
   res.sendView(key, render => {
      const p = library.postWithKey(key);
      if (!is.value(p)) { res.notFound(); return; }
      p.ensureLoaded()
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
         .catch(res.internalError);
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

//= Photo =====================================================================

/**
 * Small HTML table of EXIF values for given photo
 */
function exif(req, res) {
   library.getEXIF(req.params[ph.PHOTO_ID])
      .then(exif => {
         res.render(template.page.EXIF, { EXIF: exif, layout: template.layout.NONE });
      })
      .catch(res.notFound);
}

/**
 * Show post with given photo ID
 */
function postWithPhoto(req, res) {
   const photoID = req.params[ph.PHOTO_ID];

   library.getPostWithPhoto(photoID)
      .then(post => {
         if (is.value(post)) {
            res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.key + '#' + photoID);
         } else {
            res.notFound();
         }
      })
      .catch(res.notFound);
}

/**
 * Photos with tag
 */
function photosWithTag(req, res) {
   const slug = normalizeTag(decodeURIComponent(req.params[ph.PHOTO_TAG]));

   library.getPhotosWithTags(slug)
      .then(photos => {
         if (photos === null || photos.length == 0) {
            res.notFound();
         } else {
            const tag = library.tags[slug];
            const title = util.number.say(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

            res.render(template.page.PHOTO_SEARCH, {
               photos,
               config,
               title,
               layout: template.layout.NONE
            });
         }
      })
      .catch(res.notFound);
}

function tags(req, res) {
   let selected = normalizeTag(decodeURIComponent(req.params[ph.PHOTO_TAG]));
   const list = library.tags;
   const keys = Object.keys(list);
   const tags = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor((Math.random() * keys.length) + 1)];
   }

   // group tags by first letter (character)
   for (const c of C.alphabet) { tags[c] = {}; }
   for (const key in list) {
      const c = key.substr(0, 1).toLowerCase();
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

/**
 * @param {String} slug
 * @returns {String}
 */
function normalizeTag(slug) {
   if (is.value(slug)) { slug = slug.toLowerCase(); }
   return (is.defined(config.photoTagChanges, slug)) ? config.photoTagChanges[slug] : slug;
}

//= Category ==================================================================

/**
 * @param res
 * @param {String} path
 * @param {Boolean} [homePage = false]
 */
function categoryView(res, path, homePage = false) {
   res.sendView(path, render => {
      // use renderer to build view that wasn't cached
      const category = library.categoryWithKey(path);

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
   const key = req.params[ph.ROOT_CATEGORY];

   if (is.value(key)) {
      res.sendView(key, render => {
         // use renderer to build view that wasn't cached
         const category = library.categoryWithKey(key);

         if (is.value(category)) {
            const linkData = ld.fromCategory(category);
            const count = category.subcategories.length;
            const options = { subcategories: category.subcategories };
            const subtitle = 'Subcategories';

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
      subtitle: util.number.say(childCount) + ' ' + subtitle
   }));
}

//= Menu ======================================================================

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
   const slug = template.page.MOBILE_MENU_DATA;
   res.sendView(slug, render => {
      render(slug, { library, layout: template.layout.NONE });
   });
}

//= Auth ======================================================================

/**
 * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
function authView(req, res) {
   const flickr = require('./flickr');
   const google = require('./google');

   if (config.needsAuth) {
      if (flickr.auth.isEmpty()) {
         res.redirect(flickr.auth.url());
      } else if (google.auth.isEmpty()) {
         res.redirect(google.auth.url());
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
      const token = req.param('oauth_token');
      const verifier = req.param('oauth_verifier');

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

         });
   }
}

/**
 * @see https://github.com/google/google-api-nodejs-client/
 */
function googleAuth(req, res) {
   const google = require('./google');
   const code = req.param('code');

   if (is.empty(code)) {
      res.end('Cannot continue without Google authorization code');
   } else {
      google.auth.getAccessToken(code)
         .then(token => {
            res.render(template.page.AUTHORIZE, {
               title: 'Google Access',
               token: token.access,
               secret: token.refresh,
               layout: template.layout.NONE
            });
         })
         .catch(err => {
            log.error(err);
            res.status(C.httpStatus.INTERNAL_ERROR);
            res.end(err.toString());
         });
   }
}

//= Admin =====================================================================

/**
 * @param res
 * @param {string[]} viewKeys
 * @param {string[]} jsonKeys
 * @param {string[]} mapKeys
 * @param {object} [logs]
 */
function adminView(res, viewKeys, jsonKeys, mapKeys, logs) {
   res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0
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
      log.query(7)
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
            res.jsonMessage();
         }
      }))
      .catch(res.jsonError);
}

/**
 * Delete view and API caches for a post
 */
function deleteViewCache(req, res) {
   // cache keys to be invalidated
   let viewKeys = [];
   const apiHashKeys = [];
   const removals = [];
   const includeRelated = req.body['includeRelated'] == 'true';

   for (const key of req.body['selected']) {
      const p = library.postWithKey(key);

      viewKeys.push(key);

      if (is.value(p)) {
         // API calls are keyed to provider's ID
         apiHashKeys.push(p.id);

         if (includeRelated) {
            // include post categories
            viewKeys = viewKeys.concat(Object.keys(p.categories));
            // and adjacent views
            // (no need to invalidate API caches for neighboring posts
            // since correlation is not part of the API)
            if (is.value(p.next)) { viewKeys.push(p.next.key); }
            if (is.value(p.previous)) { viewKeys.push(p.previous.key); }
         }
      }
   }
   if (apiHashKeys.length > 0) {
      // remove associated Flickr API responses
      removals.push(cache.remove(flickr.cache.keysForPost, apiHashKeys));

      if (includeRelated) {
         // existing API keys implies post views which should also update menus
         viewKeys = viewKeys.concat(menuKeys.slice());
      }
   }
   // remove rendered and compressed views
   removals.push(cache.view.remove(viewKeys));

   Promise.all(removals)
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
   const keys = req.body.selected;

   cache.map.remove(keys)
      .then(() => {
         for (const s of keys) {
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

/**
 * Delete API JSON cache
 */
function deleteJsonCache(req, res) {
   const keys = req.body.selected;

   cache.remove(keys)
      .then(() => {
         keys.sort();
         res.jsonMessage(keys.join());
      })
      .catch(res.jsonError);
}


/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
// function pdfView(req, res) {
//    let post = library.postWithKey(req.params[ph.POST_KEY]);

//    if (post !== null) {
//       db.photo.loadPost(post, post => {
//          let book = new Book();
//          let layout = new Layout();
//          let pageNumber = 1;

//          book.add(makeCover(post));
//          book.add(makeCopyrightPage(post));

//          for (let p of post.photos) {
//             book.add(makePhotoPage(p, pageNumber++));
//             //indexPage.addWord(p.tags, C);
//          }

//          layout.createDocument(post.title, post.author);
//          layout.pdf.pipe(res);

//          book.render(layout, ()=> { layout.pdf.end() });
//       });
//    } else {
//       res.notFound();
//    }
// }

/**
 * @param {Post} post
 * @returns {TI.PDF.Page}
 */
// function makeCover(post) {
//    const Rectangle = TI.PDF.Element.Rectangle;
//    let p = new Page('coverPage');

//    p.pdfReady = true;
//    p.addImage(post.coverPhoto.size.normal, 'coverImage');
//    p.add(new Rectangle('coverOverlay'));
//    p.addText(post.title, 'coverTitle');
//    p.addText('photo essay by ' + post.author, 'coverByLine');
//    p.addText(post.dateTaken, 'coverDate');
//    p.addText(post.description, 'coverSummary');

//    return p;
// }

/**
 * @param {Post} post
 * @returns {TI.PDF.Page}
 */
// function makeCopyrightPage(post) {
//    let p = new Page('copyrightPage');
//    let now = new Date();
//    let year = now.getFullYear();

//    p.addText('© Copyright ' + year + ' ' + post.author, 'copyrightText');
//    p.addText(util.date.toString(now) + ' Edition', 'editionText');

//    return p;
// }

/**
 * @param {Photo} photo
 * @param {Number} number
 * @returns {TI.PDF.Page}
 */
// function makePhotoPage(photo, number) {
//    const PhotoWell = TI.PDF.Element.PhotoWell;
//    const PhotoCaption = TI.PDF.Element.Caption;
//    let p = new Page('photoPage', number);
//    let w = new PhotoWell();
//    let c = new PhotoCaption(photo.description);

//    w.addImage(photo.size.normal);
//    w.addText(photo.title);

//    if (w.image.isPortrait) {
//       // image and caption are side-by-side
//       w.style = 'photoWellLeft';
//       c.style = 'captionRight';
//    } else {
//       // image and capton are stacked
//       w.style = 'photoWellTop';
//       c.style = 'captionBottom';
//    }
//    p.add(w);
//    p.add(c);

//    return p;
// }

//= RSS =======================================================================

const MAX_RSS_RETRIES = 10;
let rssRetries = 0;

function rssFeed(req, res) {
   const Feed = require('feed');

   if (!library.postInfoLoaded) {
      if (rssRetries >= MAX_RSS_RETRIES) {
         log.error('Unable to load library after %d tries', MAX_RSS_RETRIES);
         res.render(C.httpStatus.NOT_FOUND, {title: 'Unable to load feed'});
         // reset tries so page can be refreshed
         rssRetries = 0;
      } else {
         rssRetries++;
         log.error('Library not ready when creating RSS feed — attempt %d', rssRetries);
         setTimeout(() => { rssFeed(req, res); }, 3000);
      }
      return;
   }

   const author = { name: config.owner.name, link: 'https://www.facebook.com/jason.e.abbott' };
   const copyright = 'Copyright © ' + new Date().getFullYear() + ' ' + config.owner.name + '. All rights reserved.';
   const feed = new Feed({
      title: config.site.title,
      description: config.site.description,
      link: 'http://' + config.site.domain,
      image: 'http://' + config.site.domain + '/img/logo.png',
      copyright: copyright,
      author: author
   });

   for (const p of library.posts.filter(p => p.chronological)) {
      feed.addItem({
         image: p.bigThumbURL,
         author: author,
         copyright: copyright,
         title: p.title,
         link: config.site.url + '/' + p.key,
         description: p.description,
         date: p.createdOn
      });
   }
   res.set('Content-Type', C.mimeType.XML);
   res.send(feed.rss2());
}

module.exports = {
   search(req, res) {
      const term = req.query['q'];

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

   rss: rssFeed,
   //pdf: pdfView,

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
      category: categoryMenu
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
      deleteView: deleteViewCache,
      deleteMap: deleteMapCache,
      deleteJSON: deleteJsonCache
   },
   // inject different data providers
   inject: {
      set google(g) { google = g; }
   }
};