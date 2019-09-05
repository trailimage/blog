import { HttpStatus, Header } from '@toba/node-tools';
import { Request, Response, NextFunction } from 'express';

const protocol = 'https';

/**
 * Middleware to require an SSL connection.
 */
export function requireSSL(req: Request, res: Response, next: NextFunction) {
   let forwardedProtocol = req.header(Header.ForwardedProtocol);

   if (forwardedProtocol !== undefined) {
      forwardedProtocol = forwardedProtocol.toLowerCase();
   }

   if (req.secure || forwardedProtocol == protocol) {
      // already secure
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
