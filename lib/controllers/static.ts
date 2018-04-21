import { HttpStatus, MimeType, is } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { config } from '../config';
import { owner, serialize } from '../models/json-ld';
import { Page, view } from '../views/';

function search(req: Request, res: Response) {
   const term = req.query['q'];

   if (is.value(term)) {
      res.render(Page.Search, {
         title: `Search for “${req.query['q']}”`,
         config: config
      });
   } else {
      view.notFound(req, res);
   }
}

function about(_req: Request, res: Response) {
   view.send(res, Page.About, {
      context: {
         title: 'About ' + config.site.title,
         jsonLD: serialize(owner)
      }
   });
}

function siteMap(_req: Request, res: Response) {
   view.send(res, Page.Sitemap, {
      mimeType: MimeType.XML,
      callback: render => {
         render(Page.Sitemap, {
            posts: blog.posts,
            categories: blog.categoryKeys(),
            tags: blog.tags,
            layout: null
         });
      }
   });
}

function issues(_req: Request, res: Response) {
   res.redirect(HttpStatus.PermanentRedirect, 'http://issues.' + config.domain);
}

export const staticPage = { issues, about, search, siteMap };
