import { log } from '@toba/logger';
import { MimeType, Header } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { render, Feed, Person } from '@toba/feed';
import { config } from '../config';
import { view } from '../views/';

const MAX_RSS_RETRIES = 10;

let rssRetries = 0;

export function postFeed(req: Request, res: Response) {
   if (!blog.postInfoLoaded) {
      if (rssRetries >= MAX_RSS_RETRIES) {
         log.error(`Unable to load blog after ${MAX_RSS_RETRIES} tries`);
         view.notFound(req, res);
         // reset tries so page can be refreshed
         rssRetries = 0;
      } else {
         rssRetries++;
         log.error(
            `Blog posts not ready when creating RSS feed — attempt ${rssRetries}`
         );
         setTimeout(() => {
            postFeed(req, res);
         }, 3000);
      }
      return;
   }

   const author: Person = {
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

   for (const p of blog.posts.filter(p => p.chronological)) {
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
   res.set(Header.Content.Type, MimeType.XML);
   res.send(feed.rss2());
}
