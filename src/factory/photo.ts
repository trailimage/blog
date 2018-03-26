import { Flickr } from '@toba/flickr';
import { is, inDaylightSavings } from '@toba/tools';
import { makePhotoSize } from './';
import { Photo } from '../models/';
import config from '../config';

/**
 * TODO: consider moving to Flickr module since this seems to be Flickr-
 * specific.
 *
 * Convert text to date object. Date constructor uses local time which we
 * need to defeat since local time will be different on host servers. Example:
 *
 *    2012-06-17 17:34:33
 */
export function parseDate(text: string): Date {
   const parts = text.split(' ');
   const date = parts[0].split('-').map(d => parseInt(d));
   const time = parts[1].split(':').map(d => parseInt(d));
   // convert local date to UTC time by adding offset
   const h = time[0] - config.timeZone;
   // date constructor automatically converts to local time
   const d = new Date(
      Date.UTC(date[0], date[1] - 1, date[2], h, time[1], time[2])
   );
   if (inDaylightSavings(d)) {
      d.setHours(d.getHours() - 1);
   }
   return d;
}

export function make(json: Flickr.PhotoSummary, index: number): Photo {
   const photo = new Photo(json.id, index);

   photo.sourceUrl = 'flickr.com/photos/' + json.pathalias + '/' + json.id;
   photo.title = json.title;
   photo.description = json.description._content;
   // tag slugs are later updated to proper names
   photo.tags = is.empty(json.tags) ? [] : json.tags.split(' ');
   photo.dateTaken = parseDate(json.datetaken);
   photo.latitude = parseFloat(json.latitude);
   photo.longitude = parseFloat(json.longitude);
   photo.primary = parseInt(json.isprimary) == 1;

   photo.outlierDate = false;

   photo.size = {
      preview: makePhotoSize(json, config.style.photoSizes.preview),
      normal: makePhotoSize(json, config.style.photoSizes.normal),
      big: makePhotoSize(json, config.style.photoSizes.big)
   };

   return photo;
}
