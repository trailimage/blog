import { makePhotoBlog } from './factory/index';
import config from './config';
import { log } from '@toba/logger';
import * as Express from 'express';
import * as hbs from 'express-hbs';
import * as path from 'path';
import { Layout, addTemplateMethods } from './template';
import route from './routes';
import * as compress from 'compression';
import { blockSpamReferers } from '@toba/block-spam-referer';

const root = path.join(__dirname, '..');

createWebService();

async function createWebService() {
   const app = Express();
   const port = process.env['PORT'] || 3000;

   log.info(
      `Starting ${
         config.isProduction ? 'production' : 'development'
      } application`
   );

   defineViews(app);

   if (config.needsAuth) {
      // must authenticate before normal routes are available
      route.authentication(app);
      app.listen(port);
      log.info(`Listening for authentication on port ${port}`);
   } else {
      app.use(blockSpamReferers);
      // https://github.com/expressjs/compression/blob/master/README.md
      app.use(compress());
      app.use(Express.static(root + 'dist'));

      await makePhotoBlog();
      // library must be loaded before routes are defined
      route.standard(app);
      app.listen(port);
      log.info(`Listening on port ${port}`);
   }
}

// https://github.com/donpark/hbs/blob/master/examples/extend/app.js
// https://npmjs.org/package/express-hbs
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
