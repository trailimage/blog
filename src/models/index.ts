import { JsonLD } from '@toba/json-ld';

export { Post } from './post';
export { Photo } from './photo';
export { Category } from './category';
export { PhotoSize } from './photo-size';
export { photoBlog } from './photo-blog';
export { VideoInfo } from './video-info';
export { EXIF } from './exif';

export interface IMakeJsonLD<T extends JsonLD.Thing> {
   toJsonLD(): T;
}
