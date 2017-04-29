import { Post, Photo, Flickr, Provider } from '../types/';
import util from '../util';
import is from '../is';
import re from '../regex';
import log from '../logger';
import config from '../config';
import photo from './photo.js';
import videoInfo from './video-info';
import library from '../library';
import realFlickr from '../providers/flickr';
// can be replaced with injection
let flickr = realFlickr;

/**
 * For post titles that looked like part of a series (had a colon separator)
 * but had no other parts. This does not handle ungrouping from a legitimate
 * series.
 */
function ungroup(this:Post) {
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
 */
function makeSeriesStart(this:Post) {
   this.isSeriesStart = true;
   this.key = this.seriesKey;
}

/**
 * Whether item matches key
 */
function hasKey(this:Post, key:string):boolean {
   return (this.key == key || (is.value(this.partKey) && key == this.seriesKey + '-' + this.partKey));
}

function ensureLoaded(this:Post) { return Promise.all([this.getInfo(), this.getPhotos()]); }

/**
 * Load photos for post and calculate summaries
 */
function getPhotos(this:Post):Promise<Photo[]> {
   return this.photosLoaded
      ? Promise.resolve(this.photos)
      : flickr.getSetPhotos(this.id).then((res:Flickr.SetPhotos) => updatePhotos(this, res));
}

/**
 * Add information to existing post object
 */
function getInfo(this:Post):Promise<Post> {
   return this.infoLoaded
      ? Promise.resolve(this)
      : flickr.getSetInfo(this.id).then((info:Flickr.SetInfo) => updateInfo(this, info));
}

function updateInfo(p:Post, setInfo:Flickr.SetInfo):Post {
   const thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;
   return Object.assign(p, {
      // removes video information from setInfo.description
      video: videoInfo.make(setInfo),
      createdOn: util.date.fromTimeStamp(setInfo.date_create),
      updatedOn: util.date.fromTimeStamp(setInfo.date_update),
      photoCount: setInfo.photos,
      description: setInfo.description._content.replace(/[\r\n\s]*$/, ''),
      // long description is updated after photos are loaded
      longDescription: p.description,
      // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
      // http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
      // thumb URLs may be needed before photos are loaded, e.g. in RSS XML
      bigThumbURL: thumb + '.jpg',     // 500px
      smallThumbURL: thumb + '_s.jpg',
      infoLoaded: true
   });
}

function updatePhotos(p:Post, setPhotos:Flickr.SetPhotos):Photo[] {
   p.photos = setPhotos.photo.map((img, index) => photo.make(img, index));

   if (p.photos.length > 0) {
      p.coverPhoto = p.photos.find(img => img.primary);

      if (!is.value(p.coverPhoto)) {
         log.error('No cover photo defined for %s', p.title);
         p.coverPhoto = p.photos[0];
      }

      // also updates photo tag keys to full names
      p.photoTagList = library.photoTagList(p.photos);

      if (p.chronological) {
         photo.identifyOutliers(p.photos);
         const firstDatedPhoto = p.photos.find(i => !i.outlierDate);
         if (is.value(firstDatedPhoto)) { p.happenedOn = firstDatedPhoto.dateTaken; }
      }

      if (!is.empty(p.description)) {
         p.longDescription = `${p.description} (Includes ${p.photos.length} photos`;
         p.longDescription += (is.value(p.video) && !p.video.empty) ? ' and one video)' : ')';
      }

      p.updatePhotoMarkers();
   }
   p.photosLoaded = true;

   return p.photos;
}

/**
 * Remove post details to force reload from data provider
 */
function empty(this:Post) {
   // from updateInfo()
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

   // from updatePhotos()
   this.photos = null;
   this.happenedOn = null;
   this.photoTagList = null;
   this.photoMarkers = null;
   this.longDescription = null;
   this.photosLoaded = false;
}

/**
 * Title and optional subtitle
 */
function name(this:Post|any):string {
   // context is screwed up when called from HBS template
   const p:Post = this.post ? this.post : this as Post;
   return p.title + ((p.isPartial) ? config.library.subtitleSeparator + ' ' + p.subTitle : '');
}

/**
 * Coordinate path used by Mapbox static maps
 *
 * See https://www.mapbox.com/api-documentation/#static
 *
 *    Example:
 *    pin-s-a+9ed4bd(-122.46589,37.77343),pin-s-b+000(-122.42816,37.75965)
 */
function updatePhotoMarkers(this:Post) {
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
 *
 * `chronological` whether set photos occurred together at a point in time.
 */
function make(flickrSet:Flickr.SetSummary|Flickr.FeatureSet, chronological:boolean = true):Post {
   const p:Post = {
      key: null,
      title: null,
      subTitle: null,
      description: null,
      longDescription: null,
      id: flickrSet.id,
      chronological,
      // to restore subtitle to title if ungrouped
      originalTitle: flickrSet.title,

      // photos are lazy loaded
      photosLoaded: false,
      photos: [] as Photo[],
      photoCount: 0,
      photoTagList: null,
      coverPhoto: null as Photo,

      updatedOn: null,
      createdOn: null,
      happenedOn: null,

      bigThumbURL: null,
      smallThumbURL: null,

      feature: false,
      categories: {},
      // whether post has categories
      get hasCategories() { return Object.keys(this.categories).length > 0; },

      video: null,
      infoLoaded: false,

      // whether an attempt has been made to load GPS track
      triedTrack: false,
      // whether a GPS track was found
      hasTrack: false,

      next: null as Post,
      previous: null as Post,

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
      photoMarkers: null as string,

      makeSeriesStart,
      ungroup,
      name,
      empty,
      ensureLoaded,
      getInfo,
      getPhotos,
      hasKey,
      updatePhotoMarkers
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

export default {
   make,
   inject: {
      set flickr(f:Provider.Flickr) { flickr = f; }
   }
};