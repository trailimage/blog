import { is } from '@toba/tools';
import { PhotoSize } from '../models/';

export function make(json: any, sizeField: string | string[]): PhotoSize {
   let field: string;

   if (is.array(sizeField)) {
      // iterate through size preferences to find first that isn't empty
      for (field of sizeField) {
         // break with given size url assignment if it exists in the photo summary
         if (!is.empty(json[field])) {
            break;
         }
      }
   } else {
      field = sizeField;
   }

   if (field !== null) {
      const suffix = field.replace('url', '');

      if (!is.empty(json[field])) {
         return new PhotoSize(
            parseInt(json['width' + suffix]),
            parseInt(json['height' + suffix]),
            json[field]
         );
      }
   }

   return null;
}
