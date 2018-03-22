import { Blog } from '../types/';
import { photoBlog } from '../models/index';
import { is, HttpStatus } from '@toba/tools';
import { fromPost, serialize } from '../json-ld';
import { Page, Layout } from '../template';
import { RouteParam } from '../routes';

function view(
   res: Blog.Response,
   key: string,
   pageTemplate: string = Page.Post
) {
   res.sendView(key, {
      callback: render => {
         const p = photoBlog.postWithKey(key);
         if (!is.value(p)) {
            res.notFound();
            return;
         }
         p
            .ensureLoaded()
            .then(() => {
               render(pageTemplate, {
                  post: p,
                  title: p.title,
                  // https://developers.google.com/structured-data/testing-tool/
                  jsonLD: serialize(fromPost(p)),
                  description: p.longDescription,
                  slug: key,
                  layout: Layout.None
               });
            })
            .catch(res.internalError);
      }
   });
}

/**
 * Display post that's part of a series
 */
function inSeries(req: Blog.Request, res: Blog.Response) {
   view(
      res,
      req.params[RouteParam.SeriesKey] + '/' + req.params[RouteParam.PartKey]
   );
}

function withKey(req: Blog.Request, res: Blog.Response) {
   view(res, req.params[RouteParam.PostKey]);
}

/**
 * Post with given Flickr ID
 * Redirect to normal URL
 */
function withID(req: Blog.Request, res: Blog.Response) {
   const post = photoBlog.postWithID(req.params[RouteParam.PostID]);

   if (is.value(post)) {
      res.redirect(HttpStatus.PermanentRedirect, '/' + post.key);
   } else {
      res.notFound();
   }
}

/**
 * Show post with given photo ID
 */
function withPhoto(req: Blog.Request, res: Blog.Response) {
   const photoID = req.params[RouteParam.PhotoID];

   photoBlog
      .getPostWithPhoto(photoID)
      .then(post => {
         if (is.value(post)) {
            res.redirect(
               HttpStatus.PermanentRedirect,
               '/' + post.key + '#' + photoID
            );
         } else {
            res.notFound();
         }
      })
      .catch(res.notFound);
}

/**
 * Show newest post on home page
 */
function latest(_req: Blog.Request, res: Blog.Response) {
   view(res, library.posts[0].key);
}

export default { latest, withID, withKey, withPhoto, inSeries };
