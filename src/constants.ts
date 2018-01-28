import { Time } from '@toba/utility';

//const yard = 3;
//const mile = yard * 1760;
//const equator = mile * 24901;

export {
   month,
   weekday,
   header,
   httpStatus,
   mimeType,
   encoding,
   alphabet
} from '@toba/utility';

export enum MapDataType {
   KMZ,
   KML,
   GeoJSON
}

/**
 * Route placeholders that become req.params values
 */
export const route = {
   CATEGORY: 'category',
   MONTH: 'month',
   PART_KEY: 'partKey',
   PHOTO_ID: 'photoID',
   PHOTO_TAG: 'tagSlug',
   POST_ID: 'postID',
   POST_KEY: 'postKey',
   ROOT_CATEGORY: 'rootCategory',
   SERIES_KEY: 'seriesKey',
   MAP_SOURCE: 'mapSource',
   YEAR: 'year'
};

export const flickrSize = {
   THUMB: 'url_t',
   SQUARE_75: 'url_sq',
   SQUARE_150: 'url_q',
   SMALL_240: 'url_s',
   SMALL_320: 'url_n',
   MEDIUM_500: 'url_m',
   MEDIUM_640: 'url_z',
   MEDIUM_800: 'url_c',
   LARGE_1024: 'url_l',
   LARGE_1600: 'url_h',
   LARGE_2048: 'url_k',
   ORIGINAL: 'url_o'
};

/**
 * Provider names used internally by Winston
 */
export const logTo = {
   REDIS: 'redis',
   CONSOLE: 'console',
   FILE: 'file'
};

/**
 * Durations of time in milliseconds
 */
export const time = {
   SECOND: Time.Second,
   MINUTE: Time.Minute,
   HOUR: Time.Hour,
   DAY: Time.Day,
   WEEK: Time.Week
};
