import { is, format, LinkRelation } from '@toba/tools';
import { Category } from '@trailimage/models';
import re from '../regex';
import { config } from '../config';
import { htmlEntity } from './constants';

/**
 * Format paragraphs and prose.
 */
export function story(text: string): string {
   if (is.empty(text)) {
      return text;
   }

   if (re.poetry.all.test(text)) {
      // text is entirely a poem or haiku
      text = text.replace(re.poetry.delimiter, '');

      if (re.haiku.all.test(text)) {
         // haiku
         text = formatHaiku(text, re.haiku.all);
      } else {
         // not hiaku
         text =
            '<p class="poem">' +
            text
               .replace(re.lineBreak, '<br/>')
               .replace(re.poetry.indent, '<span class="tab"></span>') +
            '</p>';
      }
   } else if (re.haiku.any.test(text)) {
      // text begins with a haiku
      text = formatHaiku(text, re.haiku.any);
   } else {
      // text has no haiku but may be partially a poem
      text = caption(text);
   }

   return text;
}

/**
 * Post provider sometimes messes up URLs that have parenthesis within them.
 *
 * @example
 *    Newsletter, No. 2: <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
 */
export function fixMalformedLink(text: string): string {
   let index = 0;

   text = text.replace(re.tag.truncatedLink, (_match, missedPart, i) => {
      index = i;
      return missedPart + '</a>';
   });

   if (index > 0) {
      const protocol = /https?:\/\//;
      const oldLink = text.substring(
         text.lastIndexOf('<a', index),
         text.indexOf('</a>', index) + 4
      );
      const newLink = oldLink.replace(re.tag.link, (_match, _url, name) => {
         // add protocol if missing
         if (!protocol.test(name)) {
            name = 'http://' + name;
         }
         return format(
            '<a href="{0}">{1}</a>',
            name,
            decodeURI(name.replace(protocol, ''))
         );
      });
      text = text.replace(oldLink, newLink);
   } else {
      text = text.replace(re.tag.ellipsisLink, '<a href="$1$2$3">$2$3</a>');
   }
   return text;
}

/**
 * If link text is a web address, replace with just domain and page.
 */
export const shortenLinkText = (text: string) =>
   text.replace(re.tag.linkToUrl, (_match, protocol, url: string) => {
      const parts = url.split('/');
      const domain = parts[0].replace('www.', '');
      // page precedes trailing slash
      let lastPart = /\/$/.test(url) ? parts.length - 2 : parts.length - 1;
      // if last part is only a query string then move to previous
      if (lastPart > 0 && /^[\?#]/.test(parts[lastPart])) {
         lastPart--;
      }

      let middle = '/';
      const page = parts[lastPart]
         .replace(re.queryString, '')
         .replace(re.tag.anchor, '')
         .replace(re.fileExt, '');

      if (lastPart > 1) {
         middle = '/&hellip;/';
      }
      if (protocol === undefined) {
         protocol = 'http://';
      }

      return (
         '<a href="' +
         protocol +
         url +
         '">' +
         domain +
         middle +
         decodeURIComponent(page) +
         '</a>'
      );
   });

/**
 * Format fractions within text.
 */
export const fraction = (text: string) =>
   text.replace(/(\d+)\/(\d+)/, '<sup>$1</sup>&frasl;<sub>$2</sub>');

/**
 * Stylize punctuation.
 */
export const typography = (text: string) =>
   is.empty(text)
      ? ''
      : text
           .replace(re.quote.rightSingle, '$1&rsquo;')
           .replace(re.quote.leftSingle, '&lsquo;$1')
           .replace(re.quote.rightDouble, '$1&rdquo;')
           .replace(re.quote.leftDouble, '&ldquo;$2')
           // restore straight quotes around link attributes
           .replace(
              re.tag.encodedLink,
              (_match, tag, name) =>
                 tag.replace(re.quote.html, '"') + name + '</a>'
           );

/**
 * Linked list of photo tags.
 *
 * TODO: make provider agnostic
 */
export function photoTagList(list: string[] | Set<string>): string {
   let links = '';
   const link = `<a href="/photo-tag/{0}" rel="${LinkRelation.Tag}">{1}</a>`;

   if (list instanceof Set) {
      list = Array.from(list);
   }

   if (is.array(list)) {
      list.sort().forEach(t => {
         links += format(link, t.toLowerCase().replace(/\W/g, ''), t) + ' ';
      });
   }
   return links;
}

/**
 * Material icon tag.
 *
 * @see https://material.io/icons/
 */
const iconTag = (name: string) =>
   `<i class="material-icons ${name}">${name}</i>`;

/**
 * HTML tag for post category icon.
 */
function categoryIcon(title: string): string {
   const map = config.style.icon.category;

   if (is.value(map)) {
      for (const name in map) {
         if (name == title) {
            return iconTag(map[name]);
         }
      }
      if (map.default) {
         return iconTag(map.default);
      }
   }
   return '';
}

/**
 * HTML tag for mode of travel category icon.
 */
function travelModeIcon(
   categories: string[] | { [key: string]: Category }
): string {
   const icons = config.style.icon;
   const map = icons.mode;

   if (!is.array(categories)) {
      categories = Object.keys(categories);
   }
   if (is.value(map)) {
      const iconName = Object.keys(map).find(iconName => {
         const re = map[iconName];
         return (categories as string[]).find(c => re.test(c)) !== undefined;
      });

      if (is.value(iconName)) {
         return iconName;
      } else if (icons.defaultMode) {
         return icons.defaultMode;
      }
   }
   return '';
}

export function linkPattern(url: string): string {
   return `<a href="${url}$1" target="_blank">$1</a>`;
}

/**
 * Replace UTF superscript with HTML superscript.
 */
export function formatNotes(notes: string): string {
   // photo credit becomes note number 0
   const start = /^\s*\*/g.test(notes) ? ' start="0"' : '';

   notes =
      '<ol class="footnotes"' +
      start +
      '><li><span>' +
      notes
         .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*/g, '')
         .replace(/[\r\n]+/g, '</span></li><li><span>')
         .replace(/<\/span><\/li><li><span>\s*$/, '') + // remove trailing empty item
      '</span></li></ol>';

   return notes.replace(
      /<li><span>\s*\*\s*/gi,
      '<li class="credit">' + iconTag('star') + '<span>'
   );
}

/**
 * Format Haiku text into three lines.
 */
export function formatHaiku(text: string, regex: RegExp): string {
   const match = regex.exec(text);

   return (
      '<p class="haiku">' +
      match[1] +
      '<br/>' +
      match[2] +
      '<br/>' +
      match[3] +
      iconTag('spa') +
      '</p>' +
      caption(text.replace(match[0], ''))
   );
}

/**
 * Format poetry text within a blockquote.
 */
function formatPoem(text: string): string {
   return (
      '<blockquote class="poem"><p>' +
      text
         .replace(re.trailingWhiteSpace, '')
         .replace(re.lineBreak, '<br/>')
         .replace(/(<br\/>){2,}/gi, '</p><p>')
         .replace(re.poetry.indent, '<span class="tab"></span>')
         .replace(re.footnote.number, '$1<sup>$2</sup>') +
      '</p></blockquote>'
   );
}

/**
 * Convert new lines to HTML paragraphs and normalize links.
 *
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace
 */
function caption(text: string): string {
   if (!is.empty(text)) {
      const ph = '[POEM]'; // poetry placeholder
      let footnotes = '';
      let poem = '';

      text = fixMalformedLink(text);
      text = shortenLinkText(text);
      text = typography(text);

      text = text
         // format footnotes separately
         .replace(
            re.footnote.text,
            (_match: string, _prefix: string, body: string) => {
               footnotes = formatNotes(body);
               return '';
            }
         )
         // set poetry aside and replace with placeholder
         .replace(
            re.poetry.any,
            (_match: string, _space: string, body: string) => {
               poem = formatPoem(body);
               return ph;
            }
         )
         // remove block quotes and wrap in fake tags that won't match subsequent operations
         .replace(
            re.quote.block,
            (_match: string, _newLines: string, body: string) =>
               '[Q]' + body.replace(re.quote.curly, '') + '[/Q]'
         );

      text = '<p>' + text + '</p>';

      text = text
         .replace(re.newLine, '</p><p>')
         .replace(re.tag.emptyParagraph, '')
         .replace(re.quip, (_match, _tag, body) => '<p class="quip">' + body)
         .replace(re.footnote.number, '$1<sup>$2</sup>')
         // restore blockquotes
         .replace(/\[\/Q][\r\n\s]*([^<]+)/g, '[/Q]<p class="first">$1')
         .replace(/(<p>)?\[Q]/g, '<blockquote><p>')
         .replace(/\[\/Q](<\/p>)?/g, '</p></blockquote>');

      if (poem.length > 0) {
         text = text
            .replace(ph, '</p>' + poem + '<p class="first">')
            .replace(re.tag.emptyParagraph, '');
      }
      return text + footnotes;
   }
   return '';
}

/**
 * Obfuscate text as HTML character entities.
 */
export const characterEntities = (text: string) =>
   text.replace(
      /[\u00A0-\u2666<>\&]/g,
      c => '&' + (htmlEntity[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';'
   );

export const html = {
   story,
   typography,
   caption,
   formatPoem,
   formatHaiku,
   photoTagList,
   fixMalformedLink,
   shortenLinkText,
   fraction,
   icon: {
      category: categoryIcon,
      mode: travelModeIcon,
      tag: iconTag
   }
};
