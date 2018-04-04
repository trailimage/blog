import { Response, Request } from 'express';
import { log } from '@toba/logger';
import { MimeType } from '@toba/tools';
import { photoBlog } from '@trailimage/models';
import { view } from '../views/';
import config from '../config';
import * as Feed from 'feed';

const MAX_RSS_RETRIES = 10;

let rssRetries = 0;

export function postFeed(req: Request, res: Response) {
   if (!photoBlog.postInfoLoaded) {
      if (rssRetries >= MAX_RSS_RETRIES) {
         log.error('Unable to load library after %d tries', MAX_RSS_RETRIES);
         view.notFound(req, res);
         // reset tries so page can be refreshed
         rssRetries = 0;
      } else {
         rssRetries++;
         log.error(
            'Library not ready when creating RSS feed — attempt %d',
            rssRetries
         );
         setTimeout(() => {
            postFeed(req, res);
         }, 3000);
      }
      return;
   }

   const author: Feed.Author = {
      name: config.owner.name,
      link: 'https://www.facebook.com/jason.e.abbott'
   };
   const copyright =
      'Copyright © ' +
      new Date().getFullYear() +
      ' ' +
      config.owner.name +
      '. All rights reserved.';
   const feed = new Feed({
      title: config.site.title,
      description: config.site.description,
      link: 'http://' + config.site.domain,
      image: 'http://' + config.site.domain + '/img/logo.png',
      copyright: copyright,
      author: author
   });

   for (const p of photoBlog.posts.filter(p => p.chronological)) {
      feed.addItem({
         image: p.bigThumbURL,
         author: author,
         copyright: copyright,
         title: p.title,
         link: config.site.url + '/' + p.key,
         description: p.description,
         date: p.createdOn
      });
   }
   res.set('Content-Type', MimeType.XML);
   res.send(feed.rss2());
}
