import { HttpStatus, Header } from '@toba/tools';
import { Request, Response, NextFunction } from 'express';

const protocol = 'https';

/**
 * Middleware to require an SSL connection.
 */
export function requireSSL(req: Request, res: Response, next: NextFunction) {
   if (
      req.secure ||
      req.header(Header.ForwardedProtocol).toLowerCase() == protocol
   ) {
      // already secure
      next();
   } else if (req.method == 'GET' || req.method == 'HEAD') {
      res.redirect(
         HttpStatus.TempRedirect,
         protocol + '://' + req.header(Header.Host) + req.originalUrl
      );
   } else {
      res.status(HttpStatus.Forbidden).send('Data must be transmitted securely');
   }
}
