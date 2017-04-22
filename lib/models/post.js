const util = require('./util');
const is = require('./is');
const re = require('./regex');
const config = require('./config');

/**
 * For post titles that looked like part of a series (had a colon separator) but had no other parts
 * This does not handle ungrouping from a legitimate series
 * @this {Post}
 */
function ungroup() {
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
 * @param {string} key
 * @this {Post}
 * @returns {boolean}
 */
function hasKey(key) {
   return (this.key == key || (is.value(this.partKey) && key == this.seriesKey + '-' + this.partKey));
}

/**
 * @this {Post}
 * @returns {Promise}
 */
function ensureLoaded() { return Promise.all([this.getInfo(), this.getPhotos()]); }

/**
 * Add information to existing post object
 * @this {Post}
 * @returns {Promise.<Post>}
 */
function getInfo(flickr) {
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
function empty() {
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
   this.triedTrack = false;

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
 * @this {Post|Object}
 * @returns {String}
 */
function name() {
   // context is screwed up when called from HBS template
   /** @type {Post} */
   const p = is.defined(this, 'post') ? this.post : this;
   return p.title + ((p.isPartial) ? config.library.subtitleSeparator + ' ' + p.subTitle : '');
}


/**
 * Coordinate path used by Mapbox static maps
 * @this {Post}
 * @see https://www.mapbox.com/api-documentation/#static
 * @example pin-s-a+9ed4bd(-122.46589,37.77343),pin-s-b+000(-122.42816,37.75965)
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
      const img = this.photos[i];
      if (img.latitude > 0) { map += '|' + img.latitude + ',' + img.longitude; }
   }

   this.photoMarkers = (is.empty(map)) ? null : encodeURIComponent('size:tiny' + map);
}

/**
 * Create post from Flickr photo set
 * @param {Flickr.SetSummary} flickrSet
 * @param {boolean} [chronological = true] Whether set photos occurred together at a point in time
 * @returns {Post|Object}
 */
function make(flickrSet, chronological = true) {
   const p = {
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

      // photo marker path for Mapbox static map
      photoMarkers: null,

      makeSeriesStart,
      ungroup: ungroup,
      name: name,
      empty,
      ensureLoaded,
      getPhotos,
      getInfo: getInfo,
      hasKey: hasKey,
      serializePhotoCoordinates
   };

   const parts = p.originalTitle.split(re.subtitle);

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

module.exports = { make };