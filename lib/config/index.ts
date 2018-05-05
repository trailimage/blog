import { Duration, env } from '@toba/tools';
import { mapProvider } from './map-provider';
import { postProvider } from './post-provider';
import { owner, site, domain } from './models';
import { redirects, photoTagChanges } from './redirects';
import { bing, facebook, mapbox, google } from './vendors';
import { keywords, style } from './views';
import { mapSource } from './mapsource';

const isProduction = process.env['NODE_ENV'] === 'production';

export const library = {
   /**
    * Characters separating title and subtitle in library source. Posts with
    * different subtitles but the same title are considered parts of a series
    */
   subtitleSeparator: ':',
   /** Photo EXIF is only shown for named artists */
   artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed'],
   /** Root category displayed on home page */
   defaultCategory: 'When'
};

export const map = {
   minimumTrackLength: 0.2,
   minimumTrackPoints: 5,
   /** Distance a track point must deviate from others to avoid Douglas-Peucker simplification */
   maxPointDeviationFeet: 0.5,
   /** Manually adjusted tracks may have infinite speeds between points so throw out anything over a threshold */
   maxPossibleSpeed: 150,
   /** Erase tracks around given latitude and longitude */
   privacyCenter: null as number[],
   /** Radius around `privacyCenter` to exclude from GeoJSON */
   privacyMiles: 1,
   /** Whether to enforce `privacy` settings */
   checkPrivacy: false,
   /** Whether track GPX files can be downloaded */
   allowDownload: true,
   /** Maximum number of photo markers to show on Mapbox static map */
   maxMarkers: 70,
   /** Link patterns to external maps with `lat`, `lon`, `zoom` and `altitude` tokens */
   link: {
      googleEarth:
         'https://earth.google.com/web/@{lat},{lon},1100a,{altitude}d,35y,0h,0t,0r',
      gaiaGPS:
         'https://www.gaiagps.com/map/?layer=GaiaTopoRasterFeet&lat={lat}&lon={lon}&zoom={zoom}'
   },
   source: mapSource
};

export const config = {
   env,
   domain,

   /** Whether any provider needs authorization tokens */
   //    get needsAuth(): boolean {
   //       const f = flickr.auth.token.access;
   //       const g = google.auth.token.access;
   //       return f === null || f === '' || g === null || g === '';
   //    },
   proxy: env('HTTPS_PROXY', null),

   /** When the application started. */
   timestamp: new Date().getTime(),

   /**
    * Whether site is running tests. This is only needed in a few particular
    * cases, such as setting the `isProduction` flag while using response
    * mocks, so set directly as needed rather than with an environment
    * variable.
    */
   testing: false,
   isProduction: isProduction,
   repoUrl: 'https://github.com/Jason-Abbott/trail-image.git',
   owner,
   site,
   library,
   cache: {
      /** Enable or disable all caching */
      setAll(enabled: boolean) {
         this.views = enabled;
         this.maps = enabled;
      },
      /** Whether to cache rendered template views */
      views: isProduction,
      /** Whether to cache GeoJSON */
      maps: true
   },
   contactLink: `<a href="mailto:${owner.email}">Contact</a>`,
   map,
   style,
   cacheDuration: Duration.Day * 2,
   retryDelay: Duration.Second * 30,

   bing,
   google,
   facebook,
   providers: {
      map: mapProvider,
      post: postProvider
   },
   mapbox,
   redirects,
   photoTagChanges,
   alwaysKeywords: 'Adventure, Scenery, Photography,',
   keywords: keywords.join(', ')
};
