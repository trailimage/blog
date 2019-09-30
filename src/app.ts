import { blockSpamReferers } from '@toba/block-spam-referer';
import compress from 'compression';
import Express from 'express';
import { ExpressHandlebars } from '@toba/handlebars';
import * as path from 'path';
import { postProvider } from '@trailimage/flickr-provider';
import { mapProvider } from '@trailimage/google-provider';
import { config as modelConfig, blog, Category } from '@trailimage/models';
import { config } from './config';
import { Layout, addTemplateMethods, requireSSL, resetCache } from './views/';
import { route } from './routes';

const root = path.join(__dirname, '..');

if (process.argv.includes('--serve')) {
   configureModels();
   createWebService();
}

export function configureModels() {
   postProvider.configure(config.providers.post);
   mapProvider.configure(config.providers.map);

   modelConfig.site = config.site;
   modelConfig.owner = config.owner;
   modelConfig.subtitleSeparator = config.posts.subtitleSeparator;
   modelConfig.maxPhotoMarkersOnMap = config.providers.map.maxMarkers;
   modelConfig.providers.post = postProvider;
   modelConfig.providers.map = mapProvider;
   modelConfig.artistsToNormalize = new RegExp(
      config.posts.artistNames.join('|')
   );
}

async function createWebService() {
   const app = Express();
   const port = process.env['PORT'] || 3000;

   console.info(
      `Starting ${
         config.isProduction ? 'production' : 'development'
      } application`
   );

   defineViews(app);

   if (false) {
      //config.needsAuth) {
      // must authenticate before normal routes are available
      route.authentication(app);
      app.listen(port);
      console.info(`Listening for authentication on port ${port}`);
   } else {
      if (config.requireSSL) {
         app.use(requireSSL);
      }
      app.use(blockSpamReferers);
      app.use(resetCache);
      // https://github.com/expressjs/compression/blob/master/README.md
      app.use(compress());
      app.use(Express.static(path.join(root, 'public')));

      await blog.load();

      blog.categories.forEach(c => {
         if (c.title.toLowerCase() != 'when') {
            c.subcategories = sortSet(c.subcategories, (c1, c2) =>
               textCompare(c1.title, c2.title)
            );
         }
      });

      const order: { [key: string]: number } = {
         When: 1,
         Who: 2,
         What: 3,
         Where: 4
      };

      blog.categories = sortMap(
         blog.categories,
         (c1, c2) => order[c1.title] - order[c2.title]
      );

      if (blog.loaded) {
         // blog must be loaded before routes are defined
         route.standard(app);
         app.listen(port);
         console.info(`Listening on port ${port}`);
      } else {
         console.error('Blog data failed to load. Stopping application.');
      }
   }
}

const textCompare = (t1: string, t2: string): number =>
   t1 < t2 ? -1 : t1 > t2 ? 1 : 0;

/**
 * Reconstruct set object in order to sort it.
 */
const sortSet = <V>(s: Set<V>, sorter: (a: V, b: V) => number): Set<V> =>
   new Set([...s.values()].sort(sorter));

/**
 * Reconstruct map object in order to sort it.
 */
const sortMap = <K, V>(
   m: Map<K, V>,
   sorter: (a: V, b: V) => number
): Map<K, V> => new Map([...m.entries()].sort((a, b) => sorter(a[1], b[1])));

/**
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see http://mustache.github.com/mustache.5.html
 */
function defineViews(app: Express.Application) {
   const viewPath = path.join(root, 'views');
   const ehb = new ExpressHandlebars({
      defaultLayout: Layout.Main!
   });

   // http://expressjs.com/4x/api.html#app-settings
   app.set('views', viewPath);
   app.set('view engine', ehb.fileExtension);
   app.engine(ehb.fileExtension, ehb.renderer);

   addTemplateMethods(ehb);
}
