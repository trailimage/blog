'use strict';

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const format = require('./format');
const template = require('./template');
const ld = require('./json-ld');
const library = require('./library');
const C = require('./constants');

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

// slug for single post within a series
const seriesPostKey = req => req.params['groupSlug'] + '/' + req.params['partSlug'];

/**
 * @param res
 * @param {String} slug
 * @param {String} [pageTemplate]
 */
function postView(res, slug, pageTemplate) {
   res.sendView(slug, render => {
      let p = library.postWithKey(slug);
      if (p === null) { res.notFound(); return; }
      p.getPhotos()
         .then(() => {
            if (pageTemplate === undefined) { pageTemplate = template.page.POST; }
            render(pageTemplate, {
               post: p,
               title: p.title,
               // https://developers.google.com/structured-data/testing-tool/
               jsonLD: ld.serialize(ld.fromPost(p)),
               description: p.longDescription,
               slug: slug,
               layout: template.layout.NONE
            });
         })
         .catch(res.internalError)
   });
}

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



   db.photo.loadPhotoPostID(photoID, postID => {
      let post = library.postWithID(postID);

      if (post !== null) {
         res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.slug + '#' + photoID);
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

   db.photo.loadPhotosWithTags(slug, photos => {
      if (photos === null || photos.length == 0) {
         res.NOT_FOUND();
      } else {
         let tag = library.tags[slug];
         let title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

         res.render(template.page.PHOTO_SEARCH, {
            photos: photos,
            config: TI.config,
            title: title,
            layout: template.layout.NONE
         });
      }
   });
}

function tags(req, res) {
   let selected = decodeURIComponent(req.params['tagSlug']);
   const alphabet = ['a','b','C','d','C','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
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
      tags: tags,
      selected: selected,
      alphabet: alphabet,
      title: keys.length + ' Photo Tags',
      config: config
   });
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

   issue(req, res) {
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

   post: {
      // display post that's part of a series
      inSeries(req, res) { postView(res, seriesPostKey(req)); },
      view(req, res) { postView(res, req.params.slug); },
      // "home" page shows latest post
      home(req, res) { postView(res, library.posts[0].slug); },
      providerID(req, res) {
         let postID = req.params['postID'];
         let post = library.postWithID(postID);

         if (post !== null) {
            res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.slug);
         } else {
            res.notFound();
         }
      }
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
      mobile: mobileMenu
   },

   auth: {
      view: authView,
      flickr: flickrAuth,
      google: googleAuth
   }
};