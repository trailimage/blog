import { Photo, VideoInfo, LinkDataModel } from './index';
import { JsonLD } from '@toba/json-ld';
import { forPost } from './json-ld';
import { slug, is } from '@toba/tools';
import { fromTimeStamp } from '../util/time';
import measure from '../map/measure';
import config from '../config';

export class Post extends LinkDataModel<JsonLD.BlogPosting> {
   id: string = null;
   key: string = null;
   title: string = null;
   subTitle: string = null;
   description: string = null;
   longDescription: string = null;
   happenedOn: Date;
   createdOn: Date;
   updatedOn: Date;
   /**
    * Whether post pictures occurred at a specific point in time (exceptions
    * are themed sets)
    */
   chronological: boolean = true;
   originalTitle: string = null;
   photosLoaded: boolean = false;
   bigThumbURL: string = null;
   smallThumbURL: string = null;
   photos: Photo[] = [];
   photoCount: number = 0;
   photoTagList: string = null;
   /** Photo coordinates stored as longitude, latitude */
   photoLocations: number[][];
   /** Top left and bottom right coordinates */
   bounds: MapBounds;
   /** Center of photo */
   centroid: Location = null;
   coverPhoto: Photo = null;
   /** Whether posts is featured in main navigation */
   feature: boolean = false;
   /** Category titles mapped to category keys */
   categories: { [key: string]: string } = {};
   infoLoaded: boolean = false;
   /** Whether attempt was made to load GPX track */
   triedTrack: boolean = false;
   /** Whether GPX track was found for the post */
   hasTrack: boolean = false;
   next: Post = null;
   previous: Post = null;
   /** Position of this post in a series */
   part: number = 0;
   /** Whether post is part of a series */
   isPartial: boolean = false;
   /** Whether next post is part of the same series */
   nextIsPart: boolean = false;
   /** Whether previous post is part of the same series */
   previousIsPart: boolean = false;
   /** Total number of posts in the series */
   totalParts: number = 0;
   /** Whether this post is the first in a series */
   isSeriesStart: boolean = false;
   seriesKey: string = null;
   partKey: string = null;
   video: VideoInfo = null;

   getPhotos: () => Promise<Photo[]> = () => Promise.resolve([]);
   getInfo: () => Promise<Post> = () => Promise.resolve(this);

   get hasCategories() {
      return Object.keys(this.categories).length > 0;
   }

   /**
    * For post titles that looked like part of a series (had a colon separator)
    * but had no other parts. This does not handle ungrouping from a legitimate
    * series.
    */
   ungroup() {
      this.title = this.originalTitle;
      this.subTitle = null;
      this.key = slug(this.originalTitle);
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
   makeSeriesStart() {
      this.isSeriesStart = true;
      this.key = this.seriesKey;
   }

   /**
    * Whether item matches key
    */
   hasKey(key: string): boolean {
      return (
         this.key == key ||
         (is.value(this.partKey) && key == this.seriesKey + '-' + this.partKey)
      );
   }

   ensureLoaded() {
      return Promise.all([this.getInfo(), this.getPhotos()]);
   }

   /**
    * Remove post details to force reload from data provider
    */
   empty() {
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
      this.bounds = null;
      this.happenedOn = null;
      this.photoTagList = null;
      this.photoLocations = null;
      this.longDescription = null;
      this.photosLoaded = false;
   }

   /**
    * Title and optional subtitle
    */
   name(this: Post | any): string {
      // context is screwed up when called from HBS template
      const p: Post = this.post ? this.post : (this as Post);
      return (
         p.title +
         (p.isPartial
            ? config.library.subtitleSeparator + ' ' + p.subTitle
            : '')
      );
   }

   /**
    * Coordinates used on Mapbox maps stored in longitude, latitude order.
    *
    * https://www.mapbox.com/api-documentation/#static
    */
   updatePhotoLocations() {
      let start = 1; // always skip first photo
      let total = this.photos.length;
      const locations: number[][] = [];
      const bounds: MapBounds = { sw: [0, 0], ne: [0, 0] };

      if (total > config.map.maxMarkers) {
         start = 5; // skip the first few which are often just prep shots
         total = config.map.maxMarkers + 5;
         if (total > this.photos.length) {
            total = this.photos.length;
         }
      }

      for (let i = start; i < total; i++) {
         const img = this.photos[i];
         if (img.latitude > 0) {
            locations.push([
               parseFloat(img.longitude.toFixed(5)),
               parseFloat(img.latitude.toFixed(5))
            ]);
            if (bounds.sw[0] == 0 || bounds.sw[0] > img.longitude) {
               bounds.sw[0] = img.longitude;
            }
            if (bounds.sw[1] == 0 || bounds.sw[1] > img.latitude) {
               bounds.sw[1] = img.latitude;
            }
            if (bounds.ne[0] == 0 || bounds.ne[0] < img.longitude) {
               bounds.ne[0] = img.longitude;
            }
            if (bounds.ne[1] == 0 || bounds.ne[1] < img.latitude) {
               bounds.ne[1] = img.latitude;
            }
         }
      }
      this.photoLocations = locations.length > 0 ? locations : null;
      this.bounds = bounds;
      this.centroid = measure.centroid(locations);
   }

   linkDataJSON(): JsonLD.BlogPosting {
      return forPost(this);
   }
}
