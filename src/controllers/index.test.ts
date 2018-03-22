import { HttpStatus, Header, MimeType } from '@toba/tools';
import cache from '../cache';
import config from '../config';
import { enableViewCache } from '../middleware/viewcache';
import { enableStatusHelpers } from '../middleware/helpers';

/**
 * Expect standard Handlebars template response
 */
export function expectTemplate(name: string) {
   expect(res.httpStatus).toBe(HttpStatus.OK);
   expect(res.rendered).toHaveProperty('template', name);
   expect(res.rendered).toHaveProperty('options');
   return res.rendered.options;
}

export function expectRedirect(path: string) {
   expect(res.redirected).toBeDefined();
   expect(res.redirected).toHaveProperty(
      'status',
      HttpStatus.PermanentRedirect
   );
   expect(res.redirected).toHaveProperty('url', path);
}

/**
 * Expectations for JSON responses
 */
export function expectJSON() {
   expect(res.httpStatus).toBe(HttpStatus.OK);
   expect(res.headers).toHaveProperty(Header.Content.Type, MimeType.JSON);
   expect(res.rendered).toHaveProperty('json');
   expect(res.rendered.json).toHaveProperty('success', true);
   expect(res.rendered.json).toHaveProperty('message');
   return res.rendered.json.message;
}

/**
 * Run exists() method for each key and confirm it does or does not exist
 */
export function expectInCache(keys: string[], exists = true) {
   return (
      Promise.all(keys.map(k => cache.view.exists(k)))
         // all() returns an array of outputs from each method
         .then(results => {
            results.forEach(r => expect(r).toBe(exists));
         })
   );
}

export function prepare(done: Function) {
   config.testing = true;
   factory.buildLibrary().then(() => {
      enableStatusHelpers(req, res, () => {
         enableViewCache(req, res, done);
      });
   });
}
