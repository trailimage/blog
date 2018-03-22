import { Flickr } from '@toba/flickr';
import { EXIF } from '../models/index';

export function make(flickrExif: Flickr.Exif[]): EXIF {
   const parser = (exif: Flickr.Exif[], tag: string, empty: string = null) => {
      for (const key in exif) {
         const e = exif[key];
         if (e.tag == tag) {
            return e.raw._content;
         }
      }
      //for (const e of exif) { if (e.tag == tag) { return e.raw._content; } }
      return empty;
   };
   return sanitizeExif({
      artist: parser(flickrExif, 'Artist'),
      compensation: parser(flickrExif, 'ExposureCompensation'),
      time: parser(flickrExif, 'ExposureTime', '0'),
      fNumber: parseFloat(parser(flickrExif, 'FNumber', '0')),
      focalLength: 0, // calculated in sanitizeExif()
      ISO: parseFloat(parser(flickrExif, 'ISO', '0')),
      lens: parser(flickrExif, 'Lens'),
      model: parser(flickrExif, 'Model'),
      software: parser(flickrExif, 'Software'),
      sanitized: false
   });
}
