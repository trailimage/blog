import { Blog } from '../types/';
import { photoBlog } from '../models/index';
import { is, alphabet } from '@toba/tools';
import config from '../config';
import util from '../util/';
import { Page, Layout } from '../template';
import { RouteParam } from '../routes';

/**
 * Small HTML table of EXIF values for given photo
 */
function exif(req: Blog.Request, res: Blog.Response) {
   photoBlog
      .getEXIF(req.params[RouteParam.PhotoID])
      .then(exif => {
         res.render(Page.EXIF, {
            EXIF: exif,
            layout: Layout.None
         });
      })
      .catch(res.notFound);
}

/**
 * Photos with tag rendered in response to click on label in photo tags page.
 */
function withTag(req: Blog.Request, res: Blog.Response) {
   const slug = normalizeTag(
      decodeURIComponent(req.params[RouteParam.PhotoTag])
   );

   photoBlog
      .getPhotosWithTags(slug)
      .then(photos => {
         if (photos === null || photos.length == 0) {
            res.notFound();
         } else {
            const tag = photoBlog.tags[slug];
            const title =
               util.number.say(photos.length) +
               ' &ldquo;' +
               tag +
               '&rdquo; Image' +
               (photos.length != 1 ? 's' : '');

            res.render(Page.PhotoSearch, {
               photos,
               config,
               title,
               layout: Layout.None
            });
         }
      })
      .catch(res.notFound);
}

function tags(req: Blog.Request, res: Blog.Response) {
   let selected = normalizeTag(
      decodeURIComponent(req.params[RouteParam.PhotoTag])
   );
   const list = photoBlog.tags;
   const keys = Object.keys(list);
   const tags: { [key: string]: { [key: string]: string } } = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor(Math.random() * keys.length + 1)];
   }

   // group tags by first letter (character)
   for (const c of alphabet) {
      tags[c] = {};
   }
   for (const key in list) {
      const c = key.substr(0, 1).toLowerCase();
      if (alphabet.indexOf(c) >= 0) {
         tags[c][key] = list[key];
      }
   }

   res.render(Page.PhotoTag, {
      tags,
      selected,
      alphabet,
      title: keys.length + ' Photo Tags',
      config
   });
}

function normalizeTag(slug: string): string {
   if (is.value(slug)) {
      slug = slug.toLowerCase();
   }
   return config.photoTagChanges[slug] ? config.photoTagChanges[slug] : slug;
}

export default { withTag, tags, exif };
