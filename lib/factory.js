'use strict';

// translate Flickr, Google and Redis responses into standard objects

const C = require('./constants');
const is = require('./is');
const re = require('./regex');
const log = require('./logger');
const map = require('./map');
const util = require('./util');
const config = require('./config');
const library = require('./library');

// can be replaced with injection
let flickr = require('./flickr');
let google = require('./google');

//region Library

/**
 * @param {Boolean} [emptyIfLoaded]
 * @return {Promise.<Library>} Resolve with list of changed post keys
 */
function buildLibrary(emptyIfLoaded = true) {
   // store existing post keys to compute changes
   let hadPostKeys = library.postKeys();
   if (emptyIfLoaded && library.loaded) { library.empty(); }
   // reset changed keys to none
   library.changedKeys = [];

   return Promise
      .all([flickr.getCollections(), flickr.getAllPhotoTags()])
      .then(([collections, tags]) => {
         // parse collections and photo tags
         library.tags = is.value(tags) ? parsePhotoTags(tags) : {};
         collections.forEach(c => buildCategory(c, true));
         correlatePosts();
         library.loaded = true;
         log.infoIcon(C.icon.flickr, 'Loaded %d photo posts from Flickr: beginning detail retrieval', library.posts.length);
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
         // to require factory or Flickr modules (risks circular dependencies)
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
 * @param {Photo|String} photo
 * @returns {Promise}
 */
function getPostWithPhoto(photo) {
   const id = (typeof photo == is.type.STRING) ? photo : photo.id;
   return flickr.getPhotoContext(id).then(sets => (is.value(sets))
      ? this.posts.find(p => p.id == sets[0].id)
      : null
   );
}

/**
 * Add post to library and link with adjacent posts
 * @param {Post} p
 */
function addPostToLibrary(p) {
   // exit if post with same ID is already present
   if (library.posts.filter(e => e.id === p.id).length > 0) { return; }
   library.posts.push(p);
   if (p.chronological && library.posts.length > 1) {
      let next = library.posts[library.posts.length - 2];
      if (next.chronological) {
         p.next = next;
         next.previous = p;
      }
   }
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

//endregion
//region Categories

/**
 * Add Flickr collection to library singleton as category
 * @param {Flickr.Collection} collection
 * @param {Boolean} root Whether a root level collection
 * @returns {Category|Object}
 */
function buildCategory(collection, root = false) {
   let exclude = config.flickr.excludeSets;
   let feature = config.flickr.featureSets;
   let category = {
      title: collection.title,
      key: util.slug(collection.title),
      subcategories: [],
      posts: [],
      get isChild() { return this.key.includes('/'); },
      get isParent() { return this.subcategories.length > 0; },
      add: addSubcategory,
      getSubcategory,
      has: hasSubcategory,
      removePost: removeCategoryPost,
      ensureLoaded: ensureCategoryLoaded
   };
   let p = null;

   if (exclude === undefined) { exclude = []; }
   if (root) { library.categories[category.title] = category; }

   if (is.array(collection.set) && collection.set.length > 0) {
      // category contains one or more posts
      for (let s of collection.set) {
         if (exclude.indexOf(s.id) == -1) {
            // see if post is already present in the library in another category
            p = library.postWithID(s.id);

            // create item object if it isn't part of an already added group
            if (!is.value(p)) { p = makePost(s); }

            // add post to category and category to post
            category.posts.push(p);
            p.categories[category.key] = category.title;

            // also add post to library (faster lookups)
            addPostToLibrary(p);
         }
      }
   }

   if (is.array(collection.collection)) {
      // recursively add subcategories
      collection.collection.forEach(c => { category.add(buildCategory(c)); });
   }

   if (root && is.array(feature)) {
      // sets to feature at the collection root can be manually defined in provider options
      for (let f of feature) {
         const post = makePost(f, false);
         post.feature = true;
         addPostToLibrary(post);
      }
   }
   return category;
}

/**
 * @param {String} key
 * @this {Category} category
 * @returns {Category}
 */
function getSubcategory(key) { return this.subcategories.find(c => c.title === key || c.key === key); }

/**
 * @param {String} key
 * @this {Category} category
 * @returns {Boolean}
 */
function hasSubcategory(key) { return this.subcategory(key) !== undefined; }

/**
 * Add nested category and update its key to include parent
 * @param {Category} subcat
 * @this {Category} category
 */
function addSubcategory(subcat) {
   if (is.value(subcat)) {
      let oldKey = subcat.key;

      subcat.key = this.key + '/' + subcat.key;
      this.subcategories.push(subcat);

      // update posts that reference the tag by its old key
      for (let p of subcat.posts) {
         delete p.categories[oldKey];
         p.categories[subcat.key] = subcat.title;
      }
   }
}

/**
 * Remove post from category and subcategories (primarily for testing)
 * @this {Category}
 * @param {Post} post
 * @returns {Category}
 */
function removeCategoryPost(post) {
   const index = this.posts.indexOf(post);
   if (index >= 0) { this.posts.splice(index, 1); }
   this.subcategories.forEach(s => { s.removePost(post); });
   return this;
}

/**
 * Ensure photos and information are loaded for all posts
 * @this {Category}
 * @returns {Promise}
 */
function ensureCategoryLoaded() {
   return Promise.all(this.posts.map(p => p.getInfo().then(p => p.getPhotos())));
}

//endregion
//region Posts

/**
 * Create post from Flickr photo set
 * @param {Flickr.SetSummary} flickrSet
 * @param {boolean} [chronological = true] Whether set photos occurred together at a point in time
 * @returns {Post|Object}
 */
function makePost(flickrSet, chronological = true) {
   let p = {
      id: flickrSet.id,
      // whether post pictures occurred at a specific point in time (exceptions are themed sets)
      chronological: chronological,
      // to restore subtitle to title if ungrouped
      originalTitle: flickrSet.title,

      // photos are lazy loaded
      photosLoaded: false,
      photos: [],
      photoCount: 0,
      coverPhoto: null,

      // whether posts is featured in main navigation
      feature: false,
      categories: {},
      // whether post has categories
      get hasCategories() { return Object.keys(this.categories).length > 0; },

      infoLoaded: false,

      // whether an attempt has been made to load GPS track
      triedTrack: false,
      // whether a GPS track was found
      hasTrack: false,

      next: null,
      previous: null,

      // position of this post in a series
      part: 0,
      // whether post is part of a series
      isPartial: false,
      // whether next post is part of the same series
      nextIsPart: false,
      // whether previous post is part of the same series
      previousIsPart: false,
      // total number of posts in series, if any
      totalParts: 0,
      // whether this post begins a series
      isSeriesStart: false,

      // serialized list of photo coordinates used to make Google mini-map
      photoCoordinates: null,

      makeSeriesStart,
      ungroup: ungroupPost,
      name: postName,
      empty: removePostInfo,
      getPhotos: getPostPhotos,
      getInfo: getPostInfo,
      hasKey: postHasKey,
      serializePhotoCoordinates
   };

   let parts = p.originalTitle.split(re.subtitle);

   p.title = parts[0];

   if (parts.length > 1) {
      p.subTitle = parts[1];
      p.seriesKey = util.slug(p.title);
      p.partKey = util.slug(p.subTitle);
      p.key = p.seriesKey + '/' + p.partKey;
   } else {
      p.key = util.slug(p.originalTitle);
   }
   return p;
}

/**
 * For post titles that looked like part of a series (had a colon separator) but had no other parts
 * This does not handle ungrouping from a legitimate series
 * @this {Post}
 */
function ungroupPost() {
   this.title = this.originalTitle;
   this.subTitle = null;
   this.key = util.slug(this.originalTitle);
   this.part = 0;
   this.totalParts = 0;
   this.isSeriesStart = false;
   this.isPartial = false;
   this.nextIsPart = false;
   this.previousIsPart = false;
   this.seriesKey = null;
   this.partKey = null;
}

/**
 * Flag post as the start of a series
 * @this {Post}
 */
function makeSeriesStart() {
   this.isSeriesStart = true;
   this.key = this.seriesKey;
}

/**
 * Whether item matches key
 * @param {String} key
 * @this {Post}
 * @returns {Boolean}
 */
function postHasKey(key) {
   return (this.key == key || (is.value(this.partKey) && key == this.seriesKey + '-' + this.partKey));
}

/**
 * Add information to existing post object
 * @this {Post}
 * @returns {Promise.<Post>}
 */
function getPostInfo() {
   if (this.infoLoaded) { return Promise.resolve(this); }

   return flickr.getSetInfo(this.id).then(setInfo => {
      const thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;

      return Object.assign(this, {
         // removes video information from setInfo.description
         video: buildVideoInfo(setInfo),
         createdOn: util.date.fromTimeStamp(setInfo.date_create),
         updatedOn: util.date.fromTimeStamp(setInfo.date_update),
         photoCount: setInfo.photos,
         description: setInfo.description._content.remove(/[\r\n\s]*$/),
         // long description is updated after photos are loaded
         longDescription: this.description,
         // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
         // http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
         // thumb URLs may be needed before photos are loaded, e.g. in RSS XML
         bigThumbURL: thumb + '.jpg',     // 500px
         smallThumbURL: thumb + '_s.jpg',
         infoLoaded: true
      });
   });
}

/**
 *
 * Remove post details to force reload from data provider
 * @this {Post}
 */
function removePostInfo() {
   // from addInfo()
   this.video = null;
   this.createdOn = null;
   this.updatedOn = null;
   this.photoCount = 0;
   this.description = null;
   this.coverPhoto = null;
   this.bigThumbURL = null;
   this.smallThumbURL = null;
   this.infoLoaded = false;

   // from getPhotos()
   this.photos = null;
   this.photoTagList = null;
   this._photoCoordinates = null;
   this._photoCoordinatesParsed = false;
   this.longDescription = null;
   this.photosLoaded = false;
}

/**
 * Title and optional subtitle
 * @this {Post}
 * @returns {String}
 */
function postName() {
   // context is screwed up when called from HBS template
   /** @type {Post} */
   let p = this; // (this instanceof Post) ? this : this.post;
   return p.title + ((p.isPartial) ? config.library.subtitleSeparator + ' ' + p.subTitle : '');
}

//endregion
//region Photos

/**
 * Load photos for post and calculate summaries
 * @this {Post}
 * @returns {Promise}
 */
function getPostPhotos() {
   if (this.photosLoaded) { return Promise.resolve(this.photos); }

   return flickr.getSetPhotos(this.id).then(setPhotos => {
      this.photos = setPhotos.photo.map((p, index) => buildPostPhoto(p, index));

      if (this.photos.length > 0) {
         this.coverPhoto = this.photos.find(p => p.primary);

         if (!is.value(this.coverPhoto)) {
            log.error('No cover photo defined for %s', this.title);
            this.coverPhoto = this.photos[0];
         }

         // also updates photo tag keys to full names
         this.photoTagList = library.photoTagList(this.photos);

         if (this.chronological) {
            identifyPhotoDateOutliers(this.photos);
            let firstDatedPhoto = this.photos.find(i => !i.outlierDate);
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
 * Parse Flickr photo summary
 * @param {Flickr.PhotoSummary} json
 * @param {Number} index Position of photo in list
 * @returns {Photo|Object}
 */
function buildPostPhoto(json, index) {
   return {
      id: json.id,
      index: index + 1,
      sourceUrl: 'flickr.com/photos/' + json.pathalias + '/' + json.id,
      title: json.title,
      description: json.description._content,
      // tag slugs are later updated to proper names
      tags: is.empty(json.tags) ? [] : json.tags.split(' '),
      dateTaken: util.date.parse(json.datetaken),
      latitude: parseFloat(json.latitude),
      longitude: parseFloat(json.longitude),
      primary: (parseInt(json.isprimary) == 1),
      /**
       * Whether taken date is an outlier compared to other photos in the same post
       * @see http://www.wikihow.com/Calculate-Outliers
       */
      outlierDate: false,
      getEXIF: ()=> getEXIF(this.id),
      size: {
         preview: buildPhotoSize(json, config.flickr.sizes.preview),
         normal: buildPhotoSize(json, config.flickr.sizes.normal),
         big: buildPhotoSize(json, config.flickr.sizes.big)
      },
      // comma-delimited list of tags
      get tagList() { return this.tags.join(','); }
   }
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
      size: { thumb: buildPhotoSize(json, sizeField) }
   };
}

/**
 * @param {Object} json
 * @param {String|String[]} sizeField Size or list of size field names in order of preference
 * @returns {Size|Object}
 */
function buildPhotoSize(json, sizeField) {
   let size = {
      url: null,
      width: 0,
      height: 0,
      // whether size is empty
      get isEmpty() { return this.url === null && this.width === 0; }
   };
   let field = null;

   if (is.array(sizeField)) {
      // iterate through size preferences to find first that isn't empty
      for (field of sizeField) {
         // break with given size url assignment if it exists in the photo summary
         if (!is.empty(json[field])) { break; }
      }
   } else {
      field = sizeField;
   }

   if (field !== null) {
      let suffix = field.remove('url');

      if (!is.empty(json[field])) {
         size.url = json[field];
         size.width = parseInt(json['width' + suffix]);
         size.height = parseInt(json['height' + suffix]);
      }
   }
   return size;
}

/**
 * Convert tags to hash of phrases keyed to their "clean" abbreviation
 * @param {Flickr.Tag[]} rawTags
 */
function parsePhotoTags(rawTags) {
   const exclusions = is.array(config.flickr.excludeTags) ? config.flickr.excludeTags : [];
   return rawTags.reduce((tags, t) => {
      let text = t.raw[0]._content;
      // ensure not machine or exluded tag
      if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) { tags[t.clean] = text; }
      return tags;
   }, {});
}

/**
 * Simplistic outlier calculation
 * @param {Photo[]} photos
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
function identifyPhotoDateOutliers(photos) {
   const median = values => {
      let half = Math.floor(values.length / 2);
      return (values.length % 2 !== 0) ? values[half] : (values[half-1] + values[half]) / 2.0;
   };
   const boundary = (values, distance) => {
      if (!is.array(values) || values.length === 0) { return null; }
      if (distance === undefined) { distance = 3; }

      // sort lowest to highest
      values.sort((d1, d2) => d1 - d2);
      let half = Math.floor(values.length / 2);
      let q1 = median(values.slice(0, half));
      let q3 = median(values.slice(half));
      let range = q3 - q1;

      return {
         min: q1 - (range * distance),
         max: q3 + (range * distance)
      };
   };
   const fence = boundary(photos.map(p => p.dateTaken.getTime()));

   if (fence !== null) {
      for (let p of photos) {
         let d = p.dateTaken.getTime();
         if (d > fence.max || d < fence.min) { p.outlierDate = true; }
      }
   }
}

/**
 * Coordinate property used by Google's static maps
 * @returns {String} Comma delimited list of coordinates
 * @this {Post}
 * @see https://developers.google.com/maps/documentation/static-maps/intro
 */
function serializePhotoCoordinates() {
   let start = 1;  // always skip first photo
   let total = this.photos.length;
   let map = '';

   if (total > config.map.maxMarkers) {
      start = 5;  // skip the first few which are often just prep shots
      total = config.map.maxMarkers + 5;
      if (total > this.photos.length) { total = this.photos.length; }
   }

   for (let i = start; i < total; i++) {
      let img = this.photos[i];
      if (img.latitude > 0) { map += '|' + img.latitude + ',' + img.longitude; }
   }

   this.photoCoordinates = (is.empty(map)) ? null : encodeURIComponent('size:tiny' + map);
}

// endregion
// region EXIF

/**
 * @param {String} photoID
 * @returns {Promise}
 */
function getEXIF(photoID) { return flickr.getExif(photoID).then(buildExif); }

/**
 * @param {Flickr.PhotoExif} flickrExif
 * @return {EXIF|Object}
 */
function buildExif(flickrExif) {
   const parser = (exif, tag, empty = null) => {
      for (let e of exif) { if (e.tag == tag) { return e.raw._content; } }
      return empty;
   };
   return sanitizeExif({
      artist: parser(flickrExif, 'Artist'),
      compensation: parser(flickrExif, 'ExposureCompensation', 0),
      time: parser(flickrExif, 'ExposureTime', 0),
      fNumber: parser(flickrExif, 'FNumber', 0),
      focalLength: 0,   // calculated in sanitizeExif()
      ISO: parser(flickrExif, 'ISO', 0),
      lens: parser(flickrExif, 'Lens'),
      model: parser(flickrExif, 'Model'),
      software: parser(flickrExif, 'Software'),
      sanitized: false
   });
}

/**
 * @param {EXIF|Object} exif
 * @returns {EXIF}
 */
function sanitizeExif(exif) {
   const numericRange = /\d\-\d/;
   const camera = text => is.empty(text) ? '' : text
      .replace('NIKON', 'Nikon')
      .replace('ILCE-7R', 'Sony α7ʀ')
      .replace('ILCE-7RM2', 'Sony α7ʀ II')
      .replace('Sony α7ʀM2', 'Sony α7ʀ II')
      .replace('VS980 4G', 'LG G2')
      .replace('XT1060', 'Motorola Moto X')
      .replace('TG-4', 'Olympus Tough TG-3');
   const lens = (text, camera) => is.empty(text) ? '' : text
      .replace(/FE 35mm.*/i, 'Sony FE 35mm ƒ2.8')
      .replace(/FE 55mm.*/i, 'Sony FE 55mm ƒ1.8')
      .replace(/FE 90mm.*/i, 'Sony FE 90mm ƒ2.8 OSS')
      .replace('58.0 mm f/1.4', 'Voigtländer Nokton 58mm ƒ1.4 SL II')
      .replace('14.0 mm f/2.8', 'Samyang 14mm ƒ2.8')
      .replace('50.0 mm f/1.4', 'Sigma 50mm ƒ1.4 EX DG')
      .replace('35.0 mm f/2.0', (/D700/.test(camera) ? 'Zeiss Distagon T* 2/35 ZF.2' : 'Nikkor 35mm ƒ2.0D'))
      .replace('100.0 mm f/2.0', 'Zeiss Makro-Planar T* 2/100 ZF.2')
      .replace('150.0 mm f/2.8', 'Sigma 150mm ƒ2.8 EX DG HSM APO')
      .replace('90.0 mm f/2.8', 'Tamron 90mm ƒ2.8 SP AF Di')
      .replace('24.0 mm f/3.5', 'Nikkor PC-E 24mm ƒ3.5D ED')
      .replace('14.0-24.0 mm f/2.8', 'Nikon 14–24mm ƒ2.8G ED')
      .replace('24.0-70.0 mm f/2.8', 'Nikon 24–70mm ƒ2.8G ED')
      .replace('17.0-55.0 mm f/2.8', 'Nikon 17–55mm ƒ2.8G')
      .replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10–20mm ƒ4–5.6 EX DC HSM')
      .replace('1 NIKKOR VR 30-110mm f/3.8-5.6', 'Nikkor 1 30–110mm ƒ3.8–5.6 VR')
      .replace('1 NIKKOR VR 10-30mm f/3.5-5.6', 'Nikkor 1 10–30mm ƒ3.5–5.6 VR')
      .replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18–200mm ƒ3.5–5.6G ED VR')
      .replace(/Voigtlander Heliar 15mm.*/i, 'Voigtländer Heliar 15mm ƒ4.5 III');
   const software = text => is.empty(text) ? '' : text
      .replace('Photoshop Lightroom', 'Lightroom')
      .replace(/\s*\(Windows\)/, '');
   const compensation = text => {
      if (text == '0') { text = 'No'; }
      return text;
   };

   if (!exif.sanitized) {
      if (is.value(exif.artist) && re.artist.test(exif.artist)) {
         // only sanitize EXIF for photos shot by known artists
         exif.model = camera(exif.model);
         exif.lens = lens(exif.lens, exif.model);
         exif.compensation = compensation(exif.compensation);
         exif.ISO = parseInt(exif.ISO);
         // don't show focal length for primes
         if (!numericRange.test(exif.lens)) { exif.focalLength = null; }
      }
      exif.software = software(exif.software);
      exif.sanitized = true;
   }
   return exif;
}

// endregion
// region Tracks and Waypoints

const cache = require('./cache');

/**
 * Load all map information (track and photo features) for a post
 * @param {String} postKey
 * @returns {Promise.<ViewCacheItem>}
 * @see http://geojsonlint.com/
 */
const mapForPost = postKey => config.cache.maps
   ? cache.map.getItem(postKey).then(item => is.cacheItem(item) ? item : loadMapForPost(postKey))
   : loadMapForPost(postKey);

/**
 * @param {String} postKey
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
         .catch(err => noGPX);

   return getFeatures
      .then(geo => mapPhotoFeatures(post, geo))
      .then(geo => cache.map.add(postKey, geo));
}

/**
 * Append photo GeoFeatures to GeoJSON
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} [geo]
 * @returns {Promise.<Object>} GeoJSON
 */
const mapPhotoFeatures = (post, geo) => new Promise(resolve => {
   // move to the first post in a series
   if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }
   addPhotoFeature(post, geo, resolve);
});

/**
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} geo
 * @param {function} resolve
 */
function addPhotoFeature(post, geo, resolve) {
   post.getPhotos().then(photos => {
      // specific slug is needed to link photo back to particular part in series
      let partKey = post.isPartial ? post.key : null;

      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => map.pointFromPhoto(p, partKey)));

      if (post.nextIsPart) {
         addPhotoFeature(post.next, geo, resolve);
      } else {
         resolve(geo);
      }
   });
}

//endregion
//region Video

/**
 * Get video ID and dimensions
 * @param {Flickr.SetInfo} setInfo
 * @returns {Object}
 */
function buildVideoInfo(setInfo) {
   let d = setInfo.description._content;

   if (re.video.test(d))	{
      let match = re.video.exec(d);
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

//endregion

module.exports = {
   buildLibrary,
   map: {
      forPost: mapForPost
   },
   // inject different data providers
   inject: {
      set flickr(f) { flickr = f; },
      set google(g) { google = g; }
   }
};