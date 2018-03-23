import { is } from '@toba/tools';
import { geoJSON } from '@toba/map';
import { PhotoSize, EXIF, IMappable } from './';

export class Photo implements IMappable<GeoJSON.Point> {
   id: string = null;
   index: number;
   sourceUrl: string = null;
   title: string = null;
   description: string = null;
   tags: string[] = [];
   dateTaken: Date;
   latitude: number;
   longitude: number;
   primary: boolean = false;
   size: { [key: string]: PhotoSize } = {};
   preview: PhotoSize = null;
   normal: PhotoSize = null;
   big: PhotoSize = null;

   private _exif: EXIF = null;

   /**
    * Whether taken date is an outlier compared to other photos in the same post
    * @see http://www.wikihow.com/Calculate-Outliers
    */
   outlierDate?: boolean;

   constructor(id: string, index: number) {
      this.id = id;
      this.index = index;
   }

   // comma-delimited list of tags
   get tagList(this: Photo): string {
      return this.tags.join(',');
   }

   getExif(): Promise<EXIF> {
      return Promise.resolve(this._exif);
   }

   geoJSON(partKey?: string): GeoJSON.Feature<GeoJSON.Point> {
      const properties: MapPhoto = { url: this.size.preview.url };

      if (partKey !== undefined) {
         // implies GeoJSON for single post
         properties.title = this.title;
         properties.partKey = partKey;
      }
      return {
         type: geoJSON.Type.Feature,
         properties,
         geometry: geoJSON.geometry(geoJSON.Type.Point, [
            this.longitude,
            this.latitude
         ])
      } as GeoJSON.Feature<GeoJSON.Point>;
   }
}

/**
 * Simplistic outlier calculation
 *
 * https://en.wikipedia.org/wiki/Outlier
 * http://www.wikihow.com/Calculate-Outliers
 */
export function identifyOutliers(photos: Photo[]) {
   const median = (values: number[]) => {
      const half = Math.floor(values.length / 2);
      return values.length % 2 !== 0
         ? values[half]
         : (values[half - 1] + values[half]) / 2.0;
   };
   const boundary = (values: number[], distance?: number) => {
      if (!is.array(values) || values.length === 0) {
         return null;
      }
      if (distance === undefined) {
         distance = 3;
      }

      // sort lowest to highest
      values.sort((d1, d2) => d1 - d2);
      const half = Math.floor(values.length / 2);
      const q1 = median(values.slice(0, half));
      const q3 = median(values.slice(half));
      const range = q3 - q1;

      return {
         min: (q1 - range * distance) as number,
         max: (q3 + range * distance) as number
      };
   };
   const fence = boundary(photos.map(p => p.dateTaken.getTime()));

   if (fence !== null) {
      for (const p of photos) {
         const d = p.dateTaken.getTime();
         if (d > fence.max || d < fence.min) {
            p.outlierDate = true;
         }
      }
   }
}

/**
 * GeoJSON properties for photos.
 */
export interface MapPhoto {
   url?: string;
   title?: string;
   partKey?: string;
   /** Distance from clicked cluster */
   distance?: number;
}
