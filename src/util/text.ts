import is from '../is';
import re from '../regex';
import * as url from 'url';

/**
 * Replace placeholders with arbitrary arguments
 */
export function format(text:string, ...insertions:(string|number)[]):string {
   for (let i = 0; i < insertions.length; i++) {
      text = text.replace('{' + i + '}', insertions[i] as string);
   }
   return text;
}

export const capitalize = (text:string) =>
   is.empty(text) ? '' : text.substr(0, 1).toUpperCase() + text.substr(1).toLowerCase();

/**
 * Capitalize words
 */
export const properCase = (text:string) => is.empty(text) ? '' : text
   .replace('', '');

/**
 * Make URL slug
 */
export const slug = (text:string) => is.empty(text)
   ? null
   : text
      .toLowerCase()
      .replace(/[\s\/-]+/g, '-')
      .replace('à', 'a')
      .replace(/[^\-a-z0-9]/g, '');

/**
 * Remove IPv6 prefix from transitional addresses
 *
 * https://en.wikipedia.org/wiki/IPv6_address
 */
export const IPv6 = (ip:string) =>
   (is.empty(ip) || ip === '::1') ? '127.0.0.1' : ip.replace(/^::[0123456789abcdef]{4}:/g, '');

// http://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html
export const decodeBase64 = (text:string) => (new Buffer(text, 'base64')).toString();
export const encodeBase64 = (text:string) => (new Buffer(text)).toString('base64');

/**
 * http://stackoverflow.com/questions/617647/where-is-my-one-line-implementation-of-rot13-in-javascript-going-wrong
 */
export const rot13 = (text:string) =>
   is.empty(text) ? null :	text.replace(/[a-zA-Z]/g, chr => {
      const start = chr <= 'Z' ? 65 : 97;
      return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
   });

/**
 * Infer top level domain from URL
 *
 * https://github.com/igormilla/top-domain
 */
export const topDomain = (address:string) => {
   const parsed = url.parse(address.toLowerCase());
   const domain = (parsed.host !== null) ? parsed.host : parsed.path;
   const match = domain.match(re.domain);

   return match ? match[0] : parsed.host;
};