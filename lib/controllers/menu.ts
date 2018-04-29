import { MimeType, Header } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { config } from '../config';
import { Page, view } from '../views/';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * @see https://github.com/mishoo/UglifyJS2
 */
export function data(_req: Request, res: Response) {
   const minify = config.isProduction && !config.testing;
   // vary caching depending on the accepted encoding
   res.setHeader(Header.Vary, Header.Accept.Encoding);
   view.send(res, Page.PostMenuData, { blog }, MimeType.JSONP, minify);
}

export function mobile(_req: Request, res: Response) {
   view.send(res, Page.MobileMenuData, { blog });
}

export const menu = { mobile, data };
