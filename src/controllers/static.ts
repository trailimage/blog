import { photoBlog } from '../models/index';
import { is, HttpStatus, MimeType } from '@toba/tools';
import { serialize, owner } from '../models/json-ld';
import config from '../config';
import { Page } from '../template';
import { Response, Request } from 'express';
import { notFound, sendView } from '../response';

export function search(req: Request, res: Response) {
   const term = req.query['q'];

   if (is.value(term)) {
      res.render(Page.Search, {
         title: 'Search for “' + req.query['q'] + '”',
         config: config
      });
   } else {
      notFound(res);
   }
}

export function about(_req: Request, res: Response) {
   sendView(res, Page.About, {
      templateValues: {
         title: 'About ' + config.site.title,
         jsonLD: serialize(owner)
      }
   });
}

export function siteMap(_req: Request, res: Response) {
   sendView(res, Page.Sitemap, {
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

export function issues(_req: Request, res: Response) {
   res.redirect(HttpStatus.PermanentRedirect, 'http://issues.' + config.domain);
}

export const staticPage = { issues, about, search, siteMap };
