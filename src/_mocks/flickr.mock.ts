import * as fs from 'fs';
import flickr from '../providers/flickr';

/**
 * @param {string} method Name of Flickr API method to call
 * @param {function} transform Method to transform the result for testing
 */
const call = (method: string, transform: Function) =>
   new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/flickr.' + method + '.json', (err, data) => {
         if (err === null) {
            resolve(transform(JSON.parse(data.toString())));
         } else {
            reject(err);
         }
      });
   });

export default {
   cache: flickr.cache,
   getCollections: () =>
      call('collections.getTree', r => r.collections.collection),
   getAllPhotoTags: () => call('tags.getListUserRaw', r => r.who.tags.tag),
   getPhotoSizes: id => call('photos.getSizes', r => r.sizes.size),
   getPhotoContext: id => call('photos.getAllContexts', r => r.set),
   photoSearch: tags => call('photos.search', r => r.photos.photo),
   getSetInfo: id =>
      call('photosets.getInfo', r => {
         const info = r.photoset;
         info.id = id;
         info.title._content = 'Mock for ' + id;
         return info;
      }),
   getSetPhotos: id =>
      call('photosets.getPhotos', r => {
         const photos = r.photoset;
         photos.id = id;
         photos.title = 'Mock for ' + id;
         return photos;
      }),
   getExif: id =>
      call('photos.getExif', r => {
         const exif = r.photo.EXIF;
         exif.id = id;
         return exif;
      })
};
