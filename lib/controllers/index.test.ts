import { HttpStatus } from '@toba/tools';
import { MockResponse } from '@toba/test';

/**
 * Expect standard Handlebars template response.
 * @returns template context
 */
export function expectTemplate(
   res: MockResponse,
   name: string
): { [key: string]: any } {
   expect(res.statusCode).toBe(HttpStatus.OK);
   expect(res.rendered).toHaveProperty('template', name);
   expect(res.rendered).toHaveProperty('context');
   return res.rendered.context;
}

/**
 *  Expect redirected response.
 */
export function expectRedirect(res: MockResponse, path: string) {
   expect(res.redirected).toBeDefined();
   expect(res.redirected).toHaveProperty(
      'status',
      HttpStatus.PermanentRedirect
   );
   expect(res.redirected).toHaveProperty('url', path);
}

/**
 * Expectations for JSON responses.
 */
// export function expectJSON(res: MockResponse) {
//    expect(res.httpStatus).toBe(HttpStatus.OK);
//    expect(res.headers).toHaveProperty(Header.Content.Type, MimeType.JSON);
//    expect(res.rendered).toHaveProperty('json');
//    expect(res.rendered.json).toHaveProperty('success', true);
//    expect(res.rendered.json).toHaveProperty('message');
//    return res.rendered.json.message;
// }

/**
 * Run exists() method for each key and confirm it does or does not exist
 */
// export function expectInCache(keys: string[], exists = true) {
//    return (
//       Promise.all(keys.map(k => cache.view.exists(k)))
//          // all() returns an array of outputs from each method
//          .then(results => {
//             results.forEach(r => expect(r).toBe(exists));
//          })
//    );
// }
