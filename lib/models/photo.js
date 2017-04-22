const is = require('../is');
const util = require('../util');
const config = require('./config');
const photoSize = require('./photo-size');

/**
 * Parse Flickr photo summary
 * @param {Flickr.PhotoSummary} json
 * @param {Number} index Position of photo in list
 * @returns {Photo|Object}
 */
function make(json, index) {
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
      getEXIF: ()=> getEXIF(this.id),
      size: {
         preview: photoSize.make(json, config.flickr.sizes.preview),
         normal: photoSize.make(json, config.flickr.sizes.normal),
         big: photoSize.make(json, config.flickr.sizes.big)
      },
      // comma-delimited list of tags
      get tagList() { return this.tags.join(','); }
   };
}

/**
 * Simplistic outlier calculation
 * @param {Photo[]} photos
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
function identifyOutliers(photos) {
   const median = values => {
      const half = Math.floor(values.length / 2);
      return (values.length % 2 !== 0) ? values[half] : (values[half-1] + values[half]) / 2.0;
   };
   const boundary = (values, distance) => {
      if (!is.array(values) || values.length === 0) { return null; }
      if (distance === undefined) { distance = 3; }

      // sort lowest to highest
      values.sort((d1, d2) => d1 - d2);
      const half = Math.floor(values.length / 2);
      const q1 = median(values.slice(0, half));
      const q3 = median(values.slice(half));
      const range = q3 - q1;

      return {
         min: q1 - (range * distance),
         max: q3 + (range * distance)
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

module.exports = { make, identifyOutliers };
