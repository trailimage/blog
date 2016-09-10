'use strict';

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const format = require('./format');
const template = require('./template');
const linkData = require('./json-ld');
// https://npmjs.org/package/uglify-js
const uglify = require('uglify-js');
const library = require('./library');
const C = require('./constants');

// region Helpers

// map screen loads then makes AJAX call to fetch data
function mapView(post, req, res) {
   if (post !== null) {
      let slug = post.isPartial ? post.seriesSlug : post.slug;

      res.render(template.page.map, {
         layout: template.layout.NONE,
         title: 'Map',
         post: post,
         slug: slug,
         photoID: req.params.photoID || 0,
         config: config
      });
   } else {
      res.NOT_FOUND();
   }
}

function postView(res, slug, pageTemplate) {
   res.sendView(slug, render => {
      let p = library.postWithSlug(slug);
      if (p === null) { res.NOT_FOUND(); return; }
      db.photo.loadPost(p, post => {
         if (pageTemplate === undefined) { pageTemplate = template.page.post; }
         // https://developers.google.com/structured-data/testing-tool/
         let ld = linkData.fromPost(post);

         render(pageTemplate, {
            post: post,
            title: post.title,
            jsonLD: ld.serialize(),
            description: post.longDescription,
            slug: slug,
            layout: template.layout.NONE
         });
      });
   });
}

// slug for single post within a series
const seriesPostSlug = req => req.params['groupSlug'] + '/' + req.params['partSlug'];

// endregion

module.exports = {
   search(req, res) {
      let term = req.query['q'];

      if (is.value(term)) {
         res.render(template.page.SEARCH, {
            title: 'Search for “' + req.query['q'] + '”',
            config: config
         });
      } else {
         res.NOT_FOUND();
      }
   },

   about(req, res)  {
      let ld = linkData.owner;

      res.sendView('about', {
         title: 'About ' + config.site.title,
         jsonLD: ld.serialize()
      });
   },

   siteMap(req, res) {
      res.sendView(template.page.SITEMAP, C.mimeType.XML, render => {
         render(template.page.SITEMAP, {
            posts: library.posts,
            tags: library.categorySlugs(),
            photoTags: library.photoTags,
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
            log.ERROR('Unable to load library after %d tries', MAX_RETRIES);
            res.render(C.httpStatus.NOT_FOUND, {'title': 'Unable to load feed'});
            // reset tries so page can be refreshed
            retries = 0;
         } else {
            retries++;
            log.ERROR('Library not ready when creating RSS feed — attempt %d', retries);
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
      inSeries(req, res) { postView(res, seriesPostSlug(req)); },
      view(req, res) { postView(res, req.params.slug); },
      // "home" page shows latest post
      home(req, res) { postView(res, library.posts[0].slug); },
      providerID(req, res) {
         let postID = req.params['postID'];
         let post = library.postWithID(postID);

         if (post !== null) {
            res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.slug);
         } else {
            res.NOT_FOUND();
         }
      }
   },

   map: {
      // download GPX
      download(req, res) {
         let post = config.map.allowDownload ? library.postWithSlug(req.params['slug']) : null;

         if (post !== null) {
            db.file.loadGPX(post, res);
         } else {
            res.NOT_FOUND();
         }
      },

      // load compressed GeoJSON as zipped byte array in CacheItem
      json(req, res) {
         db.file.loadMap(req.params['slug'], item => {
            if (item != null) {
               res.sendCompressed(C.mimeType.JSON, item, false);
            } else {
               res.NOT_FOUND();
            }
         });
      },

      forPost(req, res) {
         mapView(library.postWithSlug(req.params['slug']), req, res);
      },

      forSeries(req, res) {
         mapView(library.postWithSlug(req.params['groupSlug'], req.params['partSlug']), req, res);
      }
   },

   photo: {
      // small HTML table of EXIF values for given photo
      exif(req, res) {
         db.photo.loadExif(req.params['photoID'], exif => {
            res.render(template.page.EXIF, { EXIF: exif, layout: template.layout.NONE });
         });
      },

      // show post with given photo ID
      inPost(req, res) {
         let photoID = req.params['photoID'];

         db.photo.loadPhotoPostID(photoID, postID => {
            let post = library.postWithID(postID);

            if (post !== null) {
               res.redirect(httpStatus.PERMANENT_REDIRECT, '/' + post.slug + '#' + photoID);
            } else {
               res.NOT_FOUND();
            }
         });
      },

      // photos for given tag
      withTag(req, res) {
         let slug = decodeURIComponent(req.params['tagSlug']);

         db.photo.loadPhotosWithTags(slug, photos => {
            if (photos === null || photos.length == 0) {
               res.NOT_FOUND();
            } else {
               let tag = library.photoTags[slug];
               let title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

               res.render(template.page.PHOTO_SEARCH, {
                  photos: photos,
                  config: TI.config,
                  title: title,
                  layout: template.layout.NONE
               });
            }
         });
      },

      tags(req, res) {
         let selected = decodeURIComponent(req.params['tagSlug']);
         const alphabet = ['a','b','C','d','C','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
         let list = library.photoTags;
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
   },

   menu: {
      data(req, res)  {
         let slug = template.page.POST_MENU_DATA;
         res.setHeader('Vary', 'Accept-Encoding');
         res.sendView(slug, C.mimeType.JSONP, render => {
            render(
               slug,
               { library: library, layout: template.layout.NONE },
               // post-process rendered output
               text => uglify.minify(text, {fromString: true}).code);
         });
      },

      // menu for mobile devices
      mobile(req, res) {
         let slug = template.page.MOBILE_MENU_DATA;
         res.sendView(slug, render => {
            render(slug, { library: library, layout: template.layout.NONE });
         });
      }
   },

   auth: {
      /**
       * @param req
       * @param res
       * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
       */
      view(req, res) {
         if (db.needsAuth) {
            if (db.photo.needsAuth) {

            } else if (db.file.needsAuth) {
               res.redirect(db.file.authorizationURL);
            }
         } else {
            // we shouldn't be here
         }
      },

      /**
       * Default route action
       * @see http://www.flickr.com/services/api/auth.oauth.html
       */
      flickr(req, res) {
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
      },

      /**
       * @see https://github.com/google/google-api-nodejs-client/
       */
      google(req, res) {
         const google = require('./google-drive');
         const code = req.params('code');
         if (is.empty(code)) {
            log.ERROR('Cannot continue without Google authorization code');
            res.INTERNAL_ERROR();
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
   }
};