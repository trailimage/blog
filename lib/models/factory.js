// translate Flickr, Google and Redis responses into standard objects

const C = require('../constants');
const is = require('../is');
const re = require('../regex');
const log = require('../logger');
const map = require('../map');
const config = require('../config');
const library = require('./library');
const Category = require('./category');
const PhotoSize = require('./photo-size');
const Post = require('./post');
const Photo = require('./photo');
const cache = require('./cache');

const BLOG_JSON_KEY = 'blog-map';

// can be replaced with injection
let flickr = require('./flickr');
let google = require('./google');

/**
 * @param {boolean} [emptyIfLoaded]
 * @returns {Promise.<Library>} Resolve with list of changed post keys
 */
function buildLibrary(emptyIfLoaded = true) {
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
         collections.forEach(c => Category.make(c, true));
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
            let changedKeys = [];
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
 * @this {Library}
 * @param {Photo|string} photo
 * @returns {Promise}
 */
function getPostWithPhoto(photo) {
   const id = (typeof photo == is.type.STRING) ? photo : photo.id;
   return flickr.getPhotoContext(id).then(sets => (is.value(sets))
      ? this.posts.find(p => p.id == sets[0].id)
      : null
   );
}


//= Photos ====================================================================

/**
 * Load photos for post and calculate summaries
 * @this {Post}
 * @returns {Promise.<Photo[]>}
 */
function getPostPhotos() {
   if (this.photosLoaded) { return Promise.resolve(this.photos); }

   return flickr.getSetPhotos(this.id).then(setPhotos => {
      this.photos = setPhotos.photo.map((p, index) => Photo.make(p, index));

      if (this.photos.length > 0) {
         this.coverPhoto = this.photos.find(p => p.primary);

         if (!is.value(this.coverPhoto)) {
            log.error('No cover photo defined for %s', this.title);
            this.coverPhoto = this.photos[0];
         }

         // also updates photo tag keys to full names
         this.photoTagList = library.photoTagList(this.photos);

         if (this.chronological) {
            Photo.identifyOutliers(this.photos);
            const firstDatedPhoto = this.photos.find(i => !i.outlierDate);
            if (is.value(firstDatedPhoto)) { this.dateTaken = firstDatedPhoto.dateTaken; }
         }

         if (!is.empty(this.description)) {
            this.longDescription = `${this.description} (Includes ${this.photos.length} photos`;
            this.longDescription += (is.value(this.video) && !this.video.empty) ? ' and one video)' : ')';
         }

         this.serializePhotoCoordinates();
      }
      this.photosLoaded = true;

      return this.photos;
   });
}

/**
 * All photos with given tags
 * @param {String|String[]} tags
 * @returns {Promise}
 */
function getPhotosWithTags(tags) {
   return flickr.photoSearch(tags).then(photos =>
      photos.map(p => buildSearchPhoto(p, config.flickr.photoSize.search))
   );
}

/**
 * Parse Flickr photo summary used in thumb search
 * @param {Object} json
 * @param {String|String[]} sizeField
 * @returns {Photo|Object}
 */
function buildSearchPhoto(json, sizeField) {
   // thumbnail is the only size displayed in search result
   if (is.array(sizeField)) { sizeField = sizeField[0]; }
   return {
      id: json.id,
      size: { thumb: PhotoSize.make(json, sizeField) }
   };
}

/**
 * Convert tags to hash of phrases keyed to their "clean" abbreviation
 * @param {Flickr.Tag[]} rawTags
 */
function parsePhotoTags(rawTags) {
   const exclusions = is.array(config.flickr.excludeTags) ? config.flickr.excludeTags : [];
   return rawTags.reduce((tags, t) => {
      const text = t.raw[0]._content;
      // ensure not machine or exluded tag
      if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) { tags[t.clean] = text; }
      return tags;
   }, {});
}

/**
 * @param {string} photoID
 * @returns {Promise}
 */
function getEXIF(photoID) { return flickr.getExif(photoID).then(buildExif); }



/**
 * Load all map information (track and photo features) for a post
 * @param {string} postKey
 * @returns {Promise.<ViewCacheItem>}
 * @see http://geojsonlint.com/
 */
const mapForPost = postKey => config.cache.maps
   ? cache.map.getItem(postKey).then(item => is.cacheItem(item) ? item : loadMapForPost(postKey))
   : loadMapForPost(postKey);

/**
 * Load map photos for all posts.
 * @returns {Promise.<ViewCacheItem>}
 */
const mapForBlog = () => config.cache.maps
   ? cache.map.getItem(BLOG_JSON_KEY).then(item => is.cacheItem(item) ? item : loadMap())
   : loadMap();

/**
 * Get photo GeoJSON (not tracks) for all posts.
 * @returns {Promise.<ViewCacheItem>}
 */
const loadMap = () => Promise.resolve(map.features())
   .then(geo => mapPhotoFeatures(geo))
   .then(geo => cache.map.add(BLOG_JSON_KEY, geo));

/**
 * Get GeoJSON for single post. If post has no track then GPX will only include
 * photo markers.
 * @param {string} postKey
 * @returns {Promise.<ViewCacheItem>}
 */
function loadMapForPost(postKey) {
   const post = library.postWithKey(postKey);

   if (!is.value(post)) { throw new ReferenceError(`Post ${postKey} not found in library`); }

   const noGPX = Promise.resolve(map.features());
   const getFeatures = (post.triedTrack && !post.hasTrack)
      ? noGPX
      : google.drive.loadGPX(post)
         .then(map.featuresFromGPX)
         .catch(() => noGPX);

   return getFeatures
      .then(geo => mapPostPhotoFeatures(post, geo))
      .then(geo => cache.map.add(postKey, geo));
}

/**
 * Append photo GeoFeatures to GeoJSON
 * @param {GeoJSON.FeatureCollection} [geo]
 * @returns {Promise.<object>} GeoJSON
 */
const mapPhotoFeatures = geo => new Promise(resolve => { addPhotoFeatures(geo, resolve); });

/**
 * Append photo GeoFeatures to GeoJSON
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} [geo]
 * @returns {Promise.<object>} GeoJSON
 */
const mapPostPhotoFeatures = (post, geo) => new Promise(resolve => {
   // move to the first post in a series
   if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }
   addPostPhotoFeatures(post, geo, resolve);
});

/**
 * Add GeoJSON feature information for all photos in library.
 * @param {GeoJSON.FeatureCollection} geo
 * @param {function} resolve
 */
function addPhotoFeatures(geo, resolve) {
   library.getPhotos().then(photos => {
      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => map.pointFromPhoto(p)));

      resolve(geo);
   });
}

/**
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} geo
 * @param {function} resolve
 */
function addPostPhotoFeatures(post, geo, resolve) {
   post.getPhotos().then(photos => {
      // specific slug is needed to link photo back to particular part in series
      const partKey = post.isPartial ? post.key : null;

      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => map.pointFromPhoto(p, partKey)));

      if (post.nextIsPart) {
         addPostPhotoFeatures(post.next, geo, resolve);
      } else {
         resolve(geo);
      }
   });
}

//= Video =====================================================================

/**
 * Get video ID and dimensions
 * @param {Flickr.SetInfo} setInfo
 * @returns {object}
 */
function buildVideoInfo(setInfo) {
   const d = setInfo.description._content;

   if (re.video.test(d))	{
      const match = re.video.exec(d);
      // remove video link from description
      setInfo.description._content = d.remove(match[0]);
      return {
         id: match[4],
         width: parseInt(match[2]),
         height: parseInt(match[3]),
         get empty() { return this.width === 0 || this.height === 0; }
      };
   } else {
      return null;
   }
}

module.exports = {
   buildLibrary,
   map: {
      forPost: mapForPost,
      forBlog: mapForBlog
   },
   // inject different data providers
   inject: {
      set flickr(f) { flickr = f; },
      set google(g) { google = g; }
   }
};