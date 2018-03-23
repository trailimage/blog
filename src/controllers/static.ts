import { photoBlog } from '../models/index';
import { is, HttpStatus, MimeType } from '@toba/tools';
import { serialize, owner } from '../models/json-ld';
import config from '../config';
import { Page, view } from '../views/';
import { Response, Request } from 'express';

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
            posts: photoBlog.posts,
            categories: photoBlog.categoryKeys(),
            tags: photoBlog.tags,
            layout: null
         });
      }
   });
}

function issues(_req: Request, res: Response) {
   res.redirect(HttpStatus.PermanentRedirect, 'http://issues.' + config.domain);
}

export const staticPage = { issues, about, search, siteMap };
