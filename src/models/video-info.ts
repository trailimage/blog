import { IMakeJsonLD } from './index';
import { JsonLD } from '@toba/json-ld';
import { forVideo } from './json-ld';

export class VideoInfo implements IMakeJsonLD<JsonLD.VideoObject> {
   id: string = null;
   width: number = 0;
   height: number = 0;

   constructor(id: string, width: number, height: number) {
      this.id = id;
      this.width = width;
      this.height = height;
   }

   get empty() {
      return this.width === 0 || this.height === 0;
   }

   toJsonLD(): JsonLD.VideoObject {
      return forVideo(this);
   }
}
