import { Blog, JsonResponse } from '../types/';
import { is, HttpStatus } from '@toba/tools';
import { log } from '@toba/logger';
import config from '../config';
import util from '../util/';

/**
 * Express middleware: add expando methods to response and request objects.
 */
export function enableStatusHelpers(
   req: Blog.Request,
   res: Blog.Response,
   next: Function
) {
   req.clientIP = () => {
      let ipAddress = req.connection.remoteAddress;
      const forwardedIP = req.header('x-forwarded-for');

      if (!is.empty(forwardedIP)) {
         // contains delimited list like "client IP, proxy 1 IP, proxy 2 IP"
         const parts = forwardedIP.split(',');
         ipAddress = parts[0];
      }
      return util.IPv6(ipAddress);
   };

   res.notFound = () => {
      log.warn(`${req.originalUrl} not found for ${req.clientIP()}`);
      res.status(HttpStatus.NotFound);
      res.render(template.page.NOT_FOUND, { title: 'Page Not Found', config });
   };

   res.internalError = (err?: Error) => {
      if (is.value(err)) {
         log.error(err);
      }
      res.status(HttpStatus.InternalError);
      res.render(template.page.INTERNAL_ERROR, { title: 'Oops', config });
   };

   // JSON helpers depend on Express .json() extension and standard response structure
   res.jsonError = (message: string) => {
      res.json({ success: false, message } as JsonResponse);
   };

   res.jsonMessage = (message: string) => {
      res.json({
         success: true,
         message: is.value(message) ? message : ''
      } as JsonResponse);
   };

   next();
}
