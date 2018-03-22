import { photoBlog } from '../models/index';
import { is, HttpStatus } from '@toba/tools';
import { Page, Layout } from '../template';
import { RouteParam } from '../routes';
import { Response, Request } from 'express';
import { sendView, notFound, internalError } from '../response';

function view(res: Response, key: string, pageTemplate: string = Page.Post) {
   sendView(res, key, {
      callback: render => {
         const p = photoBlog.postWithKey(key);
         if (!is.value(p)) {
            notFound(res);
            return;
         }
         p
            .ensureLoaded()
            .then(() => {
               render(pageTemplate, {
                  post: p,
                  title: p.title,
                  // https://developers.google.com/structured-data/testing-tool/
                  jsonLD: p.linkDataString(),
                  description: p.longDescription,
                  slug: key,
                  layout: Layout.None
               });
            })
            .catch(err => internalError(res, err));
      }
   });
}

/**
 * Display post that's part of a series
 */
function inSeries(req: Request, res: Response) {
   view(
      res,
      req.params[RouteParam.SeriesKey] + '/' + req.params[RouteParam.PartKey]
   );
}

function withKey(req: Request, res: Response) {
   view(res, req.params[RouteParam.PostKey]);
}

/**
 * Post with given Flickr ID
 * Redirect to normal URL
 */
function withID(req: Request, res: Response) {
   const post = photoBlog.postWithID(req.params[RouteParam.PostID]);

   if (is.value(post)) {
      res.redirect(HttpStatus.PermanentRedirect, '/' + post.key);
   } else {
      notFound(res);
   }
}

/**
 * Show post with given photo ID
 */
function withPhoto(req: Request, res: Response) {
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
            notFound(res);
         }
      })
      .catch(() => notFound(res));
}

/**
 * Show newest post on home page
 */
function latest(_req: Request, res: Response) {
   view(res, photoBlog.posts[0].key);
}

export const post = { latest, withID, withKey, withPhoto, inSeries };
