import { makePhotoSize } from './index';
import { Photo } from '../models/index';
import { Flickr } from '@toba/flickr';
import { is } from '@toba/tools';

export function make(json: Flickr.PhotoSummary, index: number): Photo {
   const photo = new Photo(json.id, index);

   photo.sourceUrl = 'flickr.com/photos/' + json.pathalias + '/' + json.id;
   photo.title = json.title;
   photo.description = json.description._content;
   // tag slugs are later updated to proper names
   photo.tags = is.empty(json.tags) ? [] : json.tags.split(' ');
   photo.dateTaken = util.date.parse(json.datetaken);
   photo.latitude = parseFloat(json.latitude);
   photo.longitude = parseFloat(json.longitude);
   photo.primary = parseInt(json.isprimary) == 1;

   photo.outlierDate = false;

   photo.size = {
      preview: makePhotoSize(json, config.flickr.sizes.preview),
      normal: makePhotoSize(json, config.flickr.sizes.normal),
      big: makePhotoSize(json, config.flickr.sizes.big)
   };

   return photo;
}
