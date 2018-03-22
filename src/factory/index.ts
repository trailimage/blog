import { FlickrClient } from '@toba/flickr';
import config from '../config';

export { make as makePhotoBlog } from './photo-blog';
export { make as makeCategory } from './category';
export { make as makePhoto } from './photo';
export { make as makePost } from './post';
export { make as makePhotoSize } from './photo-size';
export { make as makeVideoInfo } from './video-info';
export { make as makeEXIF } from './exif';

export const flickr = new FlickrClient(config.flickr);
