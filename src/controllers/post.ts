import { HttpStatus, is } from '@toba/node-tools';
import { blog, Post } from '@trailimage/models';
import { Request, Response } from 'express';
import { RouteParam } from '../routes';
import { Page, Layout, view } from '../views/';

function send(
   req: Request,
   res: Response,
   key: string,
   viewName: string = Page.Post
) {
   view.send(res, key, render => {
      const p = blog.postWithKey(key);
      if (!is.value<Post>(p)) {
         return view.notFound(req, res);
      }
      p.ensureLoaded()
         .then(() => {
            render(viewName, {
               post: p,
               title: p.title,
               jsonLD: p.jsonLD(), 
               layout: Layout.None,
               description: p.longDescription,
               slug: key
            });
         })
         .catch(err => view.internalError(res, err));
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

/**
 * Render post with matching key.
 */
function withKey(req: Request, res: Response) {
   send(req, res, req.params[RouteParam.PostKey]);
}

/**
 * Render post with matching provider (e.g. Flickr) ID. Redirect to normal URL.
 */
function withID(req: Request, res: Response) {
   const post = blog.postWithID(req.params[RouteParam.PostID]);

   if (is.value<Post>(post)) {
      res.redirect(HttpStatus.PermanentRedirect, '/' + post.key);
   } else {
      view.notFound(req, res);
   }
}

/**
 * Render post that contains photo with given ID.
 */
function withPhoto(req: Request, res: Response) {
   const photoID = req.params[RouteParam.PhotoID];

   blog
      .postWithPhoto(photoID)
      .then(post => {
         if (is.value<Post>(post)) {
            res.redirect(
               HttpStatus.PermanentRedirect,
               `/${post.key}#${photoID}`
            );
         } else {
            view.notFound(req, res);
         }
      })
      .catch(err => {
         console.error(err, { photoID });
         view.notFound(req, res);
      });
}

/**
 * Show newest post on home page. Provider should have populated posts newest-
 * first.
 */
function latest(req: Request, res: Response) {
   send(req, res, blog.posts[0].key!);
}

export const post = { latest, withID, withKey, withPhoto, inSeries };
