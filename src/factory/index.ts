import { is, parseNumber } from '@toba/tools';
import { FlickrClient } from '@toba/flickr';
import config from '../config';

export { make as makePhotoBlog } from './photo-blog';
export { make as makeCategory } from './category';
export { make as makePhoto } from './photo';
export { make as makePost } from './post';
export { make as makePhotoSize } from './photo-size';
export { make as makeVideoInfo } from './video-info';
export { make as makeEXIF } from './exif';

export const flickr = new FlickrClient(config.flickr);

/**
 * Timestamps are created on hosted servers so time zone isn't known.
 */
export function timeStampToDate(timestamp: Date | number | string): Date {
   if (is.date(timestamp)) {
      return timestamp;
   } else if (is.text(timestamp)) {
      timestamp = parseNumber(timestamp);
   }
   return new Date(timestamp * 1000);
}

/**
 * Example 2013-10-02T11:55Z
 *
 * http://en.wikipedia.org/wiki/ISO_8601
 * https://developers.facebook.com/docs/reference/opengraph/object-type/article/
 */
export const iso8601time = (timestamp: number | Date) =>
   timeStampToDate(timestamp).toISOString();
