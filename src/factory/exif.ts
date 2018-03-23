import { Flickr } from '@toba/flickr';
import { EXIF } from '../models/';

/**
 * Create EXIF from Flickr data.
 */
export function make(flickrExif: Flickr.Exif[]): EXIF {
   const exif = new EXIF();

   exif.artist = parse(flickrExif, 'Artist');
   exif.compensation = parse(flickrExif, 'ExposureCompensation');
   exif.time = parse(flickrExif, 'ExposureTime', '0');
   exif.fNumber = parseFloat(parse(flickrExif, 'FNumber', '0'));
   exif.focalLength = 0; // calculated in sanitizeExif()
   exif.ISO = parseFloat(parse(flickrExif, 'ISO', '0'));
   exif.lens = parse(flickrExif, 'Lens');
   exif.model = parse(flickrExif, 'Model');
   exif.software = parse(flickrExif, 'Software');

   return exif.sanitize();
}

function parse(exif: Flickr.Exif[], tag: string, empty: string = null) {
   for (const key in exif) {
      const e = exif[key];
      if (e.tag == tag) {
         return e.raw._content;
      }
   }
   //for (const e of exif) { if (e.tag == tag) { return e.raw._content; } }
   return empty;
}
