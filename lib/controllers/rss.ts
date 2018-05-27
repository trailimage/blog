import { log } from '@toba/logger';
import { MimeType, Header } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { render } from '@toba/feed';
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
         }, 1000);
      }
      return;
   }

   res.set(Header.Content.Type, MimeType.XML);
   res.write(render(blog));
   res.end();
}
