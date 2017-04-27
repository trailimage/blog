// translate Flickr, Google and Redis responses into standard objects
import is from '../is';
import log from '../logger';
import config from '../config';
import map from './map';
import library from '../library';
import category from './category';
import photoSize from './photo-size';
import realFlickr from '../providers/flickr';
import post from './post';
import exif from './exif';
import {
   Flickr,
   Provider,
   Library,
   Post,
   Photo,
   EXIF } from '../types/';

let flickr = realFlickr;

/**
 * `emptyIfLoaded` Whether to reset the library before loading
 */
function buildLibrary(emptyIfLoaded:boolean = true):Promise<Library> {
   // store existing post keys to compute changes
   const hadPostKeys = library.postKeys();
   if (emptyIfLoaded && library.loaded) { library.empty(); }
   // reset changed keys to none
   library.changedKeys = [];

   return Promise
      .all([flickr.getCollections(), flickr.getAllPhotoTags()])
      .then(([collections, tags]) => {
         // parse collections and photo tags
         library.tags = is.value(tags) ? parsePhotoTags(tags) : {};
         collections.forEach(c => category.make(c, true));
         correlatePosts();
         library.loaded = true;
         log.infoIcon('photo_library', 'Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
         // retrieve additional post info without waiting for it to finish
         Promise
            .all(library.posts.map(p => p.getInfo()))
            .then(() => {
               library.postInfoLoaded = true;
               log.info('Finished loading post details');
            });

         return Promise.resolve();
      })
      .then(()=> {
         // attach Flickr lookup methods to the library so it doesn't have
         // to require factory or Flickr modules (avoid circular dependencies)
         library.getPostWithPhoto = getPostWithPhoto;
         library.getEXIF = getEXIF;
         library.getPhotosWithTags = getPhotosWithTags;
         library.load = buildLibrary;
         return Promise.resolve();
      })
      .then(()=> {
         // find changed post and category keys so their caches can be invalidated
         if (hadPostKeys.length > 0) {
            let changedKeys:string[] = [];
            library.posts
               .filter(p => hadPostKeys.indexOf(p.key) == -1)
               .forEach(p => {
                  log.info('Found new post "%s"', p.title);
                  // all post categories will need to be refreshed
                  changedKeys = changedKeys.concat(Object.keys(p.categories));
                  // update adjecent posts to correct next/previous links
                  if (is.value(p.next)) { changedKeys.push(p.next.key); }
                  if (is.value(p.previous)) { changedKeys.push(p.previous.key); }
               });
            library.changedKeys = changedKeys;
         }
         return library;
      });
}

/**
 * Match posts that are part of a series
 */
function correlatePosts() {
   let p = library.posts[0];
   let parts = [];

   while (p != null && p.previous != null) {
      if (p.subTitle !== null) {
         parts.push(p);

         while (p.previous != null && p.previous.title == p.title) {
            p = p.previous;
            parts.unshift(p);
         }

         if (parts.length > 1) {
            parts[0].makeSeriesStart();

            for (let i = 0; i < parts.length; i++) {
               parts[i].part = i + 1;
               parts[i].totalParts = parts.length;
               parts[i].isPartial = true;

               if (i > 0) { parts[i].previousIsPart = true; }
               if (i < parts.length - 1) { parts[i].nextIsPart = true; }
            }
         } else {
            p.ungroup();
         }
         parts = [];
      }
      p = p.previous;
   }
}

function getPostWithPhoto(this:Library, photo:Photo|string):Promise<Post> {
   const id:string = (typeof photo == is.type.STRING)
      ? (photo as string)
      : (photo as Photo).id;

   return flickr.getPhotoContext(id).then(sets => (is.value(sets))
      ? this.posts.find(p => p.id == sets[0].id)
      : null
   );
}

function getEXIF(photoID:number):Promise<EXIF> {
   return flickr.getExif(photoID).then(exif.make);
}

/**
 * All photos with given tags
 */
const getPhotosWithTags = (tags:string|string[]) => flickr.photoSearch(tags)
   .then(photos => photos.map(json => ({
      id: json.id,
      size: { thumb: photoSize.make(json, config.flickr.photoSize.search[0]) }
   }  as Photo)));

/**
 * Convert tags to hash of phrases keyed to their "clean" abbreviation
 */
function parsePhotoTags(rawTags:Flickr.Tag[]):{[key:string]:string} {
   const exclusions = is.array(config.flickr.excludeTags) ? config.flickr.excludeTags : [];
   return rawTags.reduce((tags, t) => {
      const text = t.raw[0]._content;
      // ensure not machine or exluded tag
      if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) { tags[t.clean] = text; }
      return tags;
   }, {} as {[key:string]:string});
}

export default {
   buildLibrary,
   map,
   // inject different data providers
   inject: {
      set flickr(f:Provider.Flickr) {
         flickr = f;
         post.inject.flickr = f;
      },
      set google(g:Provider.Google) {
         map.inject.google = g;
      }
   }
};