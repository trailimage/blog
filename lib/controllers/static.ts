import { HttpStatus, MimeType, is } from '@toba/tools';
import { blog, owner } from '@trailimage/models';
import { Request, Response } from 'express';
import { config } from '../config';
import { Page, view } from '../views/';

/**
 * Google search results page rendered directly without the `view.send` cache
 * pipeline.
 */
function search(req: Request, res: Response) {
   const term: string = req.query['q'];

   if (is.value(term)) {
      res.render(Page.Search, {
         title: `Search for “${term}”`
      });
   } else {
      view.notFound(req, res);
   }
}

function about(_req: Request, res: Response) {
   view.send(res, Page.About, {
      title: 'About ' + config.site.title,
      jsonLD: owner()
   });
}

/**
 * XML Sitemap.
 */
function siteMap(_req: Request, res: Response) {
   view.send(
      res,
      Page.Sitemap,
      {
         posts: blog.posts,
         categories: blog.categoryKeys(),
         tags: blog.tags
      },
      MimeType.XML
   );
}

function issues(_req: Request, res: Response) {
   res.redirect(HttpStatus.PermanentRedirect, 'http://issues.' + config.domain);
}

export const staticPage = { issues, about, search, siteMap };
