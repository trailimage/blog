import { Photo, Flickr } from '../types/';
import is from '../is';
import util from '../util/';
import config from '../config';
import photoSize from './photo-size';
//import realFlickr from '../providers/flickr';

//let flickr:Provider.Flickr = realFlickr;

/**
 * Parse Flickr photo summary
 */
function make(json:Flickr.PhotoSummary, index:number):Photo {
   return {
      id: json.id,
      index: index + 1,
      sourceUrl: 'flickr.com/photos/' + json.pathalias + '/' + json.id,
      title: json.title,
      description: json.description._content,
      // tag slugs are later updated to proper names
      tags: is.empty(json.tags) ? [] : json.tags.split(' '),
      dateTaken: util.date.parse(json.datetaken),
      latitude: parseFloat(json.latitude),
      longitude: parseFloat(json.longitude),
      primary: (parseInt(json.isprimary) == 1),
      /**
       * Whether taken date is an outlier compared to other photos in the same post
       * @see http://www.wikihow.com/Calculate-Outliers
       */
      outlierDate: false,
      //getEXIF,
      size: {
         preview: photoSize.make(json, config.flickr.sizes.preview),
         normal: photoSize.make(json, config.flickr.sizes.normal),
         big: photoSize.make(json, config.flickr.sizes.big)
      },
      // comma-delimited list of tags
      get tagList(this:Photo):string { return this.tags.join(','); }
   };
}

// /**
//  * @this {Photo}
//  * @returns {Promise}
//  */
// function getEXIF() { return flickr.getExif(this.id).then(exif.make); }

/**
 * Simplistic outlier calculation
 *
 * https://en.wikipedia.org/wiki/Outlier
 * http://www.wikihow.com/Calculate-Outliers
 */
function identifyOutliers(photos:Photo[]) {
   const median = (values:number[]) => {
      const half = Math.floor(values.length / 2);
      return (values.length % 2 !== 0) ? values[half] : (values[half-1] + values[half]) / 2.0;
   };
   const boundary = (values:number[], distance?:number) => {
      if (!is.array(values) || values.length === 0) { return null; }
      if (distance === undefined) { distance = 3; }

      // sort lowest to highest
      values.sort((d1, d2) => d1 - d2);
      const half = Math.floor(values.length / 2);
      const q1 = median(values.slice(0, half));
      const q3 = median(values.slice(half));
      const range = q3 - q1;

      return {
         min: q1 - (range * distance) as number,
         max: q3 + (range * distance) as number
      };
   };
   const fence = boundary(photos.map(p => p.dateTaken.getTime()));

   if (fence !== null) {
      for (const p of photos) {
         const d = p.dateTaken.getTime();
         if (d > fence.max || d < fence.min) { p.outlierDate = true; }
      }
   }
}

export default {
   make,
   identifyOutliers
   // inject: {
   //    set flickr(f:Provider.Flickr) { flickr = f; }
   // }
};
