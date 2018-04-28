import { MimeType, Header } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { config } from '../config';
import { Layout, Page, view } from '../views/';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * @see https://github.com/mishoo/UglifyJS2
 */
export function data(_req: Request, res: Response) {
   const slug = Page.PostMenuData;
   const postProcess =
      config.isProduction && !config.testing ? view.minify : null;

   // vary caching depending on the accepted encoding
   res.setHeader(Header.Vary, Header.Accept.Encoding);
   view.send(res, slug, render => {
      render(slug, { blog, layout: Layout.None }, MimeType.JSONP, postProcess);
   });
}

export function mobile(_req: Request, res: Response) {
   view.send(res, Page.MobileMenuData, { blog });
}

export const menu = { mobile, data };
