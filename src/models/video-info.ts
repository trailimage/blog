import { LinkDataModel } from './index';
import { JsonLD } from '@toba/json-ld';
import { forVideo } from './json-ld';

export class VideoInfo extends LinkDataModel<JsonLD.VideoObject> {
   id: string = null;
   width: number = 0;
   height: number = 0;

   constructor(id: string, width: number, height: number) {
      super();
      this.id = id;
      this.width = width;
      this.height = height;
   }

   get empty() {
      return this.width === 0 || this.height === 0;
   }

   linkDataJSON(): JsonLD.VideoObject {
      return forVideo(this);
   }
}
