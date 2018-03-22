import { is } from '@toba/tools';

/**
 * URL of a specific photo size.
 */
export class PhotoSize {
   url: string = null;
   width: number = 0;
   height: number = 0;

   constructor(width: number, height: number, url: string) {
      this.width = width;
      this.height = height;
      this.url = url;
   }

   get isEmpty() {
      return this.url === null && this.width === 0;
   }
}
