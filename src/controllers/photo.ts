import { alphabet, is, sayNumber } from '@toba/tools';
import { blog } from '@trailimage/models';
import { log } from '@toba/logger';
import { Request, Response } from 'express';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

/**
 * Render HTML table of EXIF values for given photo.
 */
function exif(req: Request, res: Response) {
   const photoID = req.params[RouteParam.PhotoID];
   blog
      .getEXIF(photoID)
      .then(exif => {
         res.render(Page.EXIF, {
            EXIF: exif,
            layout: Layout.None
         });
      })
      .catch(err => {
         log.error(err, { photoID });
         view.notFound(req, res);
      });
}

/**
 * Photos with tag rendered in response to click on label in photo tags page.
 */
function withTag(req: Request, res: Response) {
   const slug = tagParam(req);

   blog
      .getPhotosWithTags(slug)
      .then(photos => {
         if (photos === null || photos.length == 0) {
            view.notFound(req, res);
         } else {
            const tag = blog.tags.get(slug);
            const title = `${sayNumber(
               photos.length
            )} &ldquo;${tag}&rdquo; Image${photos.length != 1 ? 's' : ''}`;

            res.render(Page.PhotoSearch, {
               photos,
               config,
               title,
               layout: Layout.None
            });
         }
      })
      .catch(err => {
         view.notFound(req, res);
         log.error(err, { photoTag: slug });
      });
}

/**
 * Return normalized tag name matching the requested tag or `null` if no tag
 * requested.
 */
const tagParam = (req: Request): string =>
   is.defined(req.params, RouteParam.PhotoTag)
      ? normalizeTag(decodeURIComponent(req.params[RouteParam.PhotoTag]))
      : null;

function tags(req: Request, res: Response) {
   let slug = tagParam(req);
   const list = blog.tags;
   const keys = Array.from(list.keys());
   const tags: { [key: string]: { [key: string]: string } } = {};

   if (is.empty(slug)) {
      // select a random tag
      slug = keys[Math.floor(Math.random() * keys.length + 1)];
   }

   // group tags by first letter (character)
   for (const c of alphabet) {
      tags[c] = {};
   }
   for (const [key, value] of list.entries()) {
      // key is sometimes a number
      const c = key
         .toString()
         .substr(0, 1)
         .toLowerCase();
      if (alphabet.indexOf(c) >= 0) {
         // ignore tags that don't start with a letter of the alphabet
         tags[c][key] = value;
      }
   }

   res.render(Page.PhotoTag, {
      tags,
      selected: slug,
      alphabet,
      title: keys.length + ' Photo Tags',
      config
   });
}

/**
 * Convert photo tag to lowercase and substitute changed tag if one has been
 * defined.
 */
export function normalizeTag(slug: string): string {
   if (is.value(slug)) {
      slug = slug.toLowerCase();
   } else {
      return null;
   }
   return is.defined(config.photoTagChanges, slug)
      ? config.photoTagChanges[slug]
      : slug;
}

export const photo = { withTag, tags, exif };
