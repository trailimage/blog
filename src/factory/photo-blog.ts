import { is } from '@toba/tools';
import { Flickr } from '@toba/flickr';
import { photoBlog, Photo, EXIF } from '../models/';
import { flickr, makeCategory, makeEXIF, makePhoto } from './';
import config from '../config';

/**
 * @param emptyIfLoaded Whether to reset the library before loading
 */
export function make(emptyIfLoaded: boolean = true) {
   // store existing post keys to compute changes
   const hadPostKeys = photoBlog.postKeys();

   if (!photoBlog.loaded) {
      assignFactoryMethods();
   } else if (emptyIfLoaded) {
      photoBlog.empty();
   }
   // reset changed keys to none
   photoBlog.changedKeys = [];

   return Promise.all([flickr.getCollections(), flickr.getAllPhotoTags()])
      .then(([collections, tags]) => {
         // parse collections and photo tags
         photoBlog.tags = is.value<Flickr.Tag[]>(tags)
            ? parsePhotoTags(tags)
            : {};
         collections.forEach(c => makeCategory(c, true));
         photoBlog.correlatePosts();
         photoBlog.loaded = true;

         log.info(
            `Loaded ${
               photoBlog.posts.length
            } photo posts from Flickr: beginning detail retrieval`
         );
         // retrieve additional post info without waiting for it to finish
         Promise.all(photoBlog.posts.map(p => p.getInfo())).then(() => {
            photoBlog.postInfoLoaded = true;
            log.info('Finished loading post details');
         });
      })
      .then(() => {
         // find changed post and category keys so their caches can be invalidated
         if (hadPostKeys.length > 0) {
            let changedKeys: string[] = [];
            photoBlog.posts
               .filter(p => hadPostKeys.indexOf(p.key) == -1)
               .forEach(p => {
                  log.info('Found new post "%s"', p.title);
                  // all post categories will need to be refreshed
                  changedKeys = changedKeys.concat(Object.keys(p.categories));
                  // update adjecent posts to correct next/previous links
                  if (is.value(p.next)) {
                     changedKeys.push(p.next.key);
                  }
                  if (is.value(p.previous)) {
                     changedKeys.push(p.previous.key);
                  }
               });
            photoBlog.changedKeys = changedKeys;
         }
         return photoBlog;
      });
}

const getEXIF = (photoID: string): Promise<EXIF> =>
   flickr.getExif(photoID).then(makeEXIF);

/**
 * Get first post that includes the given photo.
 */
async function getPostWithPhoto(this: typeof photoBlog, photo: Photo | string) {
   const id: string =
      typeof photo == is.Type.String ? (photo as string) : (photo as Photo).id;
   const photoSets = await flickr.getPhotoContext(id);

   return is.value(photoSets)
      ? this.posts.find(p => p.id == photoSets[0].id)
      : null;
}

/**
 * All photos with given tags.
 */
const getPhotosWithTags = (tags: string | string[]) =>
   flickr.photoSearch(tags).then(photos => photos.map(makePhoto));

function assignFactoryMethods() {
   photoBlog.getEXIF = getEXIF;
   photoBlog.getPostWithPhoto = getPostWithPhoto.bind(photoBlog);
   photoBlog.getPhotosWithTags = getPhotosWithTags;
}

/**
 * Convert tags to hash of phrases keyed to their "clean" abbreviation
 */
function parsePhotoTags(rawTags: Flickr.Tag[]): { [key: string]: string } {
   const exclusions = is.array(config.flickr.excludeTags)
      ? config.flickr.excludeTags
      : [];
   return rawTags.reduce(
      (tags, t) => {
         const text = t.raw[0]._content;
         // ensure not machine or exluded tag
         if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) {
            tags[t.clean] = text;
         }
         return tags;
      },
      {} as { [key: string]: string }
   );
}
