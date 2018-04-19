import { HttpStatus, is } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

function send(
   req: Request,
   res: Response,
   key: string,
   pageTemplate: string = Page.Post
) {
   view.send(res, key, {
      callback: render => {
         const p = blog.postWithKey(key);
         if (!is.value(p)) {
            view.notFound(req, res);
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
            .catch(err => view.internalError(res, err));
      }
   });
}

/**
 * Display post that's part of a series.
 */
function inSeries(req: Request, res: Response) {
   send(
      req,
      res,
      req.params[RouteParam.SeriesKey] + '/' + req.params[RouteParam.PartKey]
   );
}

function withKey(req: Request, res: Response) {
   send(req, res, req.params[RouteParam.PostKey]);
}

/**
 * Post with given Flickr ID. Redirect to normal URL.
 */
function withID(req: Request, res: Response) {
   const post = blog.postWithID(req.params[RouteParam.PostID]);

   if (is.value(post)) {
      res.redirect(HttpStatus.PermanentRedirect, '/' + post.key);
   } else {
      view.notFound(req, res);
   }
}

/**
 * Show post with given photo ID.
 */
function withPhoto(req: Request, res: Response) {
   const photoID = req.params[RouteParam.PhotoID];

   blog
      .postWithPhoto(photoID)
      .then(post => {
         if (is.value(post)) {
            res.redirect(
               HttpStatus.PermanentRedirect,
               `/${post.key}#${photoID}`
            );
         } else {
            view.notFound(req, res);
         }
      })
      .catch(() => view.notFound(req, res));
}

/**
 * Show newest post on home page.
 */
function latest(req: Request, res: Response) {
   send(req, res, blog.posts[0].key);
}

export const post = { latest, withID, withKey, withPhoto, inSeries };
