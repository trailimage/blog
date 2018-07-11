import { HttpStatus } from '@toba/tools';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require an SSL connection.
 */
export function requireSSL(req: Request, res: Response, next: NextFunction) {
   if (req.secure) {
      next();
   } else if (req.method == 'GET' || req.method == 'HEAD') {
      res.redirect(
         HttpStatus.TempRedirect,
         'https://' + req.header('Host') + req.originalUrl
      );
   } else {
      res.status(HttpStatus.Forbidden).send('Data must be submitted securely');
   }
}
