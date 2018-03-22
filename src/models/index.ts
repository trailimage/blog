import { JsonLD, serialize } from '@toba/json-ld';

export { Post } from './post';
export { Photo } from './photo';
export { Category } from './category';
export { PhotoSize } from './photo-size';
export { photoBlog } from './photo-blog';
export { VideoInfo } from './video-info';
export { EXIF } from './exif';

export abstract class LinkDataModel<T extends JsonLD.Thing> {
   abstract linkDataJSON(): T;
   linkDataString(): string {
      return serialize(this.linkDataJSON());
   }
}
