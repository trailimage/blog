import { log } from '@toba/logger';
import { blockSpamReferers } from '@toba/block-spam-referer';
import * as compress from 'compression';
import * as Express from 'express';
import * as hbs from 'express-hbs';
import * as path from 'path';
import { postProvider, postConfigure } from '@trailimage/flickr-provider';
import { mapProvider, mapConfigure } from '@trailimage/google-provider';
import { config as modelConfig, blog } from '@trailimage/models';
import { config } from './config';
import { Layout, addTemplateMethods } from './views/';
import { route } from './routes';

const root = path.join(__dirname, '..');

configureModels();
createWebService();

function configureModels() {
   postConfigure(config.providers.post);
   mapConfigure(config.providers.map);

   modelConfig.owner = config.owner;
   modelConfig.subtitleSeparator = config.library.subtitleSeparator;
   modelConfig.maxPhotoMarkersOnMap = config.map.maxMarkers;
   modelConfig.providers.post = postProvider;
   modelConfig.providers.map = mapProvider;
}

async function createWebService() {
   const app = Express();
   const port = process.env['PORT'] || 3000;

   log.info(
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
      log.info(`Listening for authentication on port ${port}`);
   } else {
      app.use(blockSpamReferers);
      // https://github.com/expressjs/compression/blob/master/README.md
      app.use(compress());
      app.use(Express.static(root + 'dist'));

      await blog.build();
      // blog must be loaded before routes are defined
      route.standard(app);
      app.listen(port);
      log.info(`Listening on port ${port}`);
   }
}

// https://github.com/donpark/hbs/blob/master/examples/extend/app.js
// http://mustache.github.com/mustache.5.html
function defineViews(app: Express.Application) {
   const engine = 'hbs';
   const views = path.normalize(root + 'views/');

   // http://expressjs.com/4x/api.html#app-settings
   app.set('views', views);
   app.set('view engine', engine);
   app.engine(
      engine,
      hbs.express4({
         defaultLayout: views + Layout.Main + '.hbs',
         partialsDir: views + 'partials'
      })
   );

   addTemplateMethods(hbs);
}
