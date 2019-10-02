import { HttpStatus, Header, is } from '@toba/node-tools';
import { Request, Response, NextFunction } from 'express';
import { blog } from '@trailimage/models';
import { config } from '../config';
import { cache } from './view';
import { sortCategories } from './index';

const protocol = 'https';

/**
 * Middleware to require an SSL connection.
 */
export function requireSSL(req: Request, res: Response, next: NextFunction) {
   if (req.secure) {
      next();
   }
   let forwardedProtocol = req.header(Header.ForwardedProtocol);

   if (forwardedProtocol !== undefined) {
      forwardedProtocol = forwardedProtocol.toLowerCase();
   }

   if (forwardedProtocol == protocol) {
      next();
   } else if (req.method == 'GET' || req.method == 'HEAD') {
      res.redirect(
         HttpStatus.TempRedirect,
         protocol + '://' + req.header(Header.Host) + req.originalUrl
      );
   } else {
      res.status(HttpStatus.Forbidden).send(
         'Data must be transmitted securely'
      );
   }
}

/**
 * Middleware to reset page and model caches on command.
 */
export async function checkCacheReset(
   req: Request,
   _: Response,
   next: NextFunction
) {
   if (
      is.value<string>(config.resetToken) &&
      config.resetToken == req.query.reset
   ) {
      // clear caches
      cache.clear();
      console.info('Cleared page cache');
      await blog.load(true);
      sortCategories(blog);
      console.info('Finished reloading blog data');
   }
   next();
}
