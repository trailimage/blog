import { Duration, env } from '@toba/node-tools';
import { mapProvider } from './map-provider';
import { postProvider } from './post-provider';
import { owner, site, domain } from './models';
import { redirects, photoTagChanges } from './redirects';
import { bing, facebook, mapbox, google } from './vendors';
import { keywords, style } from './views';

const isProduction = process.env['NODE_ENV'] === 'production';

export const posts = {
   /**
    * Characters separating title and subtitle in library source. Posts with
    * different subtitles but the same title are considered parts of a series
    */
   subtitleSeparator: ':',
   /** Photo EXIF is only shown for named artists */
   artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed'],
   /** Key (slug) of root category to display on home page */
   defaultCategory: 'when'
};

export const config = {
   env,
   domain,
   /** Whether to redirect `HTTP` requests to `HTTPS`. */
   requireSSL: env('REQUIRE_SSL', '') == 'true',
   /** Token to confirm cache reset request */
   resetToken: env('RESET_TOKEN', null),

   /** Whether any provider needs authorization tokens */
   //    get needsAuth(): boolean {
   //       const f = flickr.auth.token.access;
   //       const g = google.auth.token.access;
   //       return f === null || f === '' || g === null || g === '';
   //    },
   proxy: env('HTTPS_PROXY', null),

   /** When the application started. Used for cache busting. */
   timestamp: new Date().getTime(),

   /**
    * Whether site is running tests. This is only needed in a few particular
    * cases, such as setting the `isProduction` flag while using response
    * mocks, so set directly as needed rather than with an environment
    * variable.
    */
   testing: false,
   isProduction,
   repoUrl: 'https://github.com/Jason-Abbott/trail-image.git',
   owner,
   site,
   posts,
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
