import is from '../is';
import ld from '../json-ld';
import template from '../template';
import library from '../library';
import C from '../constants';
/**
 * Route placeholders
 */
const ph = C.route;

function view(res, key:string, pageTemplate:string = template.page.POST) {
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
function inSeries(req, res) {
   view(res, req.params[ph.SERIES_KEY] + '/' + req.params[ph.PART_KEY]);
}

function withKey(req, res) {
   view(res, req.params[ph.POST_KEY]);
}

/**
 * Post with given Flickr ID
 * Redirect to normal URL
 */
function withID(req, res) {
   const post = library.postWithID(req.params[ph.POST_ID]);

   if (is.value(post)) {
      res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + post.key);
   } else {
      res.notFound();
   }
}

/**
 * Show post with given photo ID
 */
function withPhoto(req, res) {
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
 * Show newest post on home page
 */
function latest(req, res) { view(res, library.posts[0].key); }

export default { latest, withID, withKey, withPhoto, inSeries };