import * as fs from 'fs';
import { Provider, Flickr } from '../../types';

const flickr = jest.genMockFromModule('../flickr') as Provider.Flickr;

const call = <T>(
   method: string,
   transform: (res: Flickr.Response) => T
): Promise<T> =>
   new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/flickr.' + method + '.json', (err, data) => {
         if (err === null) {
            resolve(transform(JSON.parse(data.toString())));
         } else {
            reject(err);
         }
      });
   });

flickr.getCollections = () =>
   call<Flickr.Collection[]>(
      'collections.getTree',
      r => r.collections.collection
   );

flickr.getAllPhotoTags = () =>
   call<Flickr.Tag[]>('tags.getListUserRaw', r => r.who.tags.tag);

flickr.getPhotoSizes = (_id: string) =>
   call<Flickr.Size[]>('photos.getSizes', r => r.sizes.size);

flickr.getPhotoContext = (_id: string) =>
   call<Flickr.MemberSet[]>('photos.getAllContexts', r => r.set);

flickr.photoSearch = (_tags: string | string[]) =>
   call<Flickr.PhotoSummary[]>(
      'photos.search',
      r => r.photos.photo as Flickr.PhotoSummary[]
   );

flickr.getSetInfo = (id: string) =>
   call<Flickr.SetInfo>('photosets.getInfo', r => {
      const info = r.photoset as Flickr.SetInfo;
      info.id = id;
      info.title._content = 'Mock for ' + id;
      return info;
   });

flickr.getSetPhotos = (id: string) =>
   call<Flickr.SetPhotos>('photosets.getPhotos', r => {
      const photos = r.photoset as Flickr.SetPhotos;
      //photos.id = id;
      photos.title = 'Mock for ' + id;
      return photos;
   });

flickr.getExif = (id: number) =>
   call<Flickr.Exif[]>('photos.getExif', r => {
      const exif = r.photo.exif;
      exif[0].label = 'Mock for ' + id;
      //exif.id = id;
      return exif;
   });

export default flickr;
