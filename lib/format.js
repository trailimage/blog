'use strict';

require('./extensions.js');

const { month, weekday } = require('./enum');
const re = require('./regex');
const config = require('./config');
const is = require('./is');
const url = require('url');
const superscript = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];

function linkPattern(url) { return '<a href="' + url + '$1" target="_blank">$1</a>' }

// replace UTF superscript with HTML superscript
function formatNotes(notes) {
   // photo credit becomes note number 0
   let start = (/^\s*\*/g.test(notes)) ? ' start="0"' : '';

   notes = '<ol class="footnotes"' + start + '><li><span>'
      + notes
         .remove(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*/g)
         .replace(/[\r\n]+/g, '</span></li><li><span>')
         .remove(/<\/span><\/li><li><span>\s*$/)         // remove trailing empty item
      + '</span></li></ol>';

   return notes.replace(/<li><span>\s*\*\s*/gi,
      '<li class="credit">' + icon('asterisk') + '<span>');
}

// format haiku text
function formatHaiku(text, regex) {
   let match = regex.exec(text);

   return '<p class="haiku">'
      + match[1] + '<br/>'
      + match[2] + '<br/>'
      + match[3] + icon(config.style.icon.haiku) + '</p>'
      + caption(text.remove(match[0]));
}

// format poetry text
function formatPoem(text) {
   return '<blockquote class="poem"><p>' + text
         .remove(re.trailingWhiteSpace)
         .replace(re.lineBreak, '<br/>')
         .replace(/(<br\/>){2,}/gi, '</p><p>')
         .replace(re.poetry.indent, '<span class="tab"></span>')
         .replace(re.footnote.number, '$1<sup>$2</sup>')
      + '</p></blockquote>';
}

// replace placeholders with arbitrary arguments
function string(text) {
   for (let i = 0; i < arguments.length; i++) {
      text = text.replace('{' + i + '}', arguments[i + 1]);
   }
   return text;
}

// convert new lines to HTML paragraphs and normalize links
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace
function caption(text) {
   if (!is.empty(text))	{
      const ph = '[POEM]';  // poetry placeholder
      let footnotes = '';
      let poem = '';

      text = fixMalformedLink(text);
      text = shortenLinkText(text);
      text = typography(text);

      text = text
      // format footnotes separately
         .replace(re.footnote.text, (match, prefix, body) => { footnotes = formatNotes(body); return ''; })
         // set poetry aside and replace with placeholder
         .replace(re.poetry.any, (match, space, body) => { poem = formatPoem(body); return ph; })
         // remove block quotes and wrap in fake tags that won't match subsequent operations
         .replace(re.quote.block, (match, newLines, body) => '[Q]' + body.remove(re.quote.curly) + '[/Q]');

      text = '<p>' + text + '</p>';

      text = text
         .replace(re.newLine, '</p><p>')
         .remove(re.tag.emptyParagraph)
         .replace(re.quip, (match, tag, body) => '<p class="quip">' + body)
         .replace(re.footnote.number, '$1<sup>$2</sup>')
         // restore blockquotes
         .replace(/\[\/Q][\r\n\s]*([^<]+)/g, '[/Q]<p class="first">$1')
         .replace(/(<p>)?\[Q]/g, '<blockquote><p>')
         .replace(/\[\/Q](<\/p>)?/g, '</p></blockquote>');

      if (poem.length > 0) {
         text = text
            .replace(ph, '</p>' + poem + '<p class="first">')
            .remove(re.tag.emptyParagraph);
      }
      return text + footnotes;
   }
   return '';
}

// Flickr sometimes messes up URLs that have parenthesis within them
// e.g. Newsletter, No. 2: <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
function fixMalformedLink(text) {
   let index = 0;

   text = text.replace(re.tag.truncatedLink, (match, missedPart, i) => {
      index = i;
      return missedPart + '</a>';
   });

   if (index > 0) {
      const protocol = /https?:\/\//;
      let oldLink = text.substring(text.lastIndexOf('<a', index), text.indexOf('</a>', index) + 4);
      let newLink = oldLink.replace(re.tag.link, (match, url, name) => {
         // add protocol if missing
         if (!protocol.test(name)) { name = 'http://' + name; }
         return string('<a href="{0}">{1}</a>', name, decodeURI(name.remove(protocol)));
      });
      text = text.replace(oldLink, newLink);
   } else {
      text = text.replace(re.tag.ellipsisLink, '<a href="$1$2$3">$2$3</a>');
   }
   return text;
}

// if link text is a web address, replace with just domain and page
const shortenLinkText = text => text.replace(re.tag.linkToUrl, (match, protocol, url) => {
   let parts = url.split('/');
   let domain = parts[0].remove('www.');
   // page precedes trailing slash
   let lastPart = /\/$/.test(url) ? parts.length - 2 : parts.length - 1;
   // if last part is only a query string then move to previous
   if (lastPart > 0 && /^[\?#]/.test(parts[lastPart])) { lastPart--; }

   let middle = '/';
   let page = parts[lastPart]
      .remove(re.queryString)
      .remove(re.tag.anchor)
      .remove(re.fileExt);

   if (lastPart > 1) { middle = '/&hellip;/'; }
   if (protocol === undefined) { protocol = 'http://'; }

   return '<a href="' + protocol + url + '">' + domain + middle + decodeURIComponent(page) + '</a>';
});

// stylize punctuation
const typography = text => is.empty(text) ? '' : text
   .replace(re.quote.rightSingle, '$1&rsquo;')
   .replace(re.quote.leftSingle, '&lsquo;$1')
   .replace(re.quote.rightDouble, '$1&rdquo;')
   .replace(re.quote.leftDouble, '&ldquo;$2')
   // restore straight quotes around link attributes
   .replace(re.tag.encodedLink, (match, tag, name) => tag.replace(re.quote.html, '"') + name + '</a>');


// Bootstrap icon tag
const icon = name => '<span class="glyphicon glyphicon-' + name + '"></span>';

module.exports = {
   icon,
   string,
   caption,
   typography,
   shortenLinkText,
   fixMalformedLink,

   // https://github.com/igormilla/top-domain
   topDomain: address => {
      let parsed = url.parse(address.toLowerCase());
      let domain = (parsed.host !== null) ? parsed.host : parsed.path;
      let match = domain.match(re.domain);

      return match ? match[0] : parsed.host;
   },

   // remove IPv6 prefix from transitional addresses
   // https://en.wikipedia.org/wiki/IPv6_address
   IPv6: ip => (is.empty(ip) || ip === '::1') ? '127.0.0.1' : ip.remove(/^::[0123456789abcdef]{4}:/g),

   // format date as Month Day, Year (March 15, 1973)
   date: d => month[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),

   logTime: text => {
      let d = new Date(text);
      //var logOffset = d.getTimezoneOffset();
      //var localOffset = (new Date()).getTimezoneOffset();

      // just be dumb for now
      if (config.isProduction) { d.setHours(d.getHours() - 6); }

      return exports.string('{0}/{1} {2} {3}:{4}:{5}.{6}',
         d.getMonth() + 1,
         d.getDate(),
         weekday[d.getDay()],
         exports.hourOfDay(d.getHours()),
         exports.leadingZeros(d.getMinutes(), 2),
         exports.leadingZeros(d.getSeconds(), 2),
         exports.leadingZeros(d.getMilliseconds(), 3)
      );
   },

   logMessage: (r, fieldName) => {
      if (is.defined(r, fieldName) && is.value(r[fieldName])) {
         r[fieldName] = r[fieldName]
            .replace(/(\d{10,11})/, linkPattern(config.log.photoUrl))
            .replace(re.log.path, '<a href="$1" target="_blank">$1</a>$2')
            .replace(re.ipAddress, linkPattern(config.log.ipLookupUrl));

      } else {
         r[fieldName] = '[no message]';
      }
      return r[fieldName];
   },

   // format fractions within the text
   fraction: text => text.replace(/(\d+)\/(\d+)/, '<sup>$1</sup>&frasl;<sub>$2</sub>'),

   // http://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html
   decodeBase64: text => (new Buffer(text, 'base64')).toString(),
   encodeBase64: text => (new Buffer(text)).toString('base64'),

   // http://stackoverflow.com/questions/617647/where-is-my-one-line-implementation-of-rot13-in-javascript-going-wrong
   rot13: text =>
      is.empty(text) ? null :	text.replace(/[a-zA-Z]/g, chr => {
         let start = chr <= 'Z' ? 65 : 97;
         return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
      }),

   // return AM or PM for the hour of the day
   hourOfDay: h => (h > 12) ? 'PM ' + (h - 12) : 'AM ' + h,

   // pad integer with leading zeroes
   leadingZeros(d, count) {
      var text = d.toString();
      while (text.length < count) { text = '0' + text; }
      return text;
   },

   // different slug style to match Flickr's photo tags
   tagList(list) {
      let links = '';
      let link = '<a href="/photo-tag/{0}" rel="tag">{1}</a>';

      if (is.array(list)) {
         list
            .sort()
            .forEach(t => { links += string(link, t.toLowerCase().replace(/\W/g, ''), t) + ' '; });
      }
      return links;
   },

   sayNumber(n, capitalize) {
      if (capitalize === undefined) { capitalize = true; }

      let word = n.toString();

      switch (n) {
         case 1: word = 'One'; break;
         case 2: word = 'Two'; break;
         case 3: word = 'Three'; break;
         case 4: word = 'Four'; break;
         case 5: word = 'Five'; break;
         case 6: word = 'Six'; break;
         case 7: word = 'Seven'; break;
         case 8: word = 'Eight'; break;
         case 9: word = 'Nine'; break;
         case 10: word = 'Ten'; break;
         case 11: word = 'Eleven'; break;
         case 12: word = 'Twelve'; break;
         case 13: word = 'Thirteen'; break;
         case 14: word = 'Fourteen'; break;
         case 15: word = 'Fifteen'; break;
         case 16: word = 'Sixteen'; break;
         case 17: word = 'Seventeen'; break;
         case 18: word = 'Eighteen'; break;
         case 19: word = 'Nineteen'; break;
         case 20: word = 'Twenty'; break;
      }
      return capitalize ? word : word.toLowerCase();
   },

   capitalize: text => is.empty(text) ? '' : text.substr(0,1).toUpperCase() + text.substr(1).toLowerCase(),

   // convert text to date object
   parseDate(text) {
      // e.g. '2012-06-17 17:34:33'
      // new Date(year, month, day, hours, minutes, seconds, milliseconds);
      let parts = text.split(' ');
      let date = parts[0].split('-');
      let time = parts[1].split(':');
      return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
   },

   parseTimeStamp: timestamp => is.date(timestamp) ? timestamp : new Date(timestamp * 1000),

   // obfuscate text as HTML character entities
   characterEntities: text => text.replace(
      /[\u00A0-\u2666<>\&]/g,
      c => '&' + (htmlEntity[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';'
   ),

   // e.g. 2013-10-02T11:55Z
   // http://en.wikipedia.org/wiki/ISO_8601
   // https://developers.facebook.com/docs/reference/opengraph/object-type/article/
   iso8601time: timestamp => this.parseTimeStamp(timestamp).toISOString(),

   // convert decimal hours to hours:minutes
   hoursAndMinutes(hours) {
      let h = Math.floor(hours);
      let m = hours - h;

      return h + ':' + exports.leadingZeros(Math.round(60 * m), 2);
   },

   // make URL slug
   slug: text => is.empty(text) ? null : text.toLowerCase().replace(/[\s\/-]+/g, '-').remove(/[^\-a-z0-9]/g),

   // remove non-numeric characters from string
   parseNumber(text) {
      text = (text ? text : '').remove(/[^\d\.]/g);
      return is.empty(text) ? NaN : parseFloat(text);
   },

   // shuffle an array
   // http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
   shuffle(a) {
      if (!is.array(a) || a.length === 0) { return null; }

      let i = a.length;

      while (--i) {
         let j = Math.floor(Math.random() * (i + 1));
         let temp = a[i];
         a[i] = a[j];
         a[j] = temp;
      }
      return a;
   },

   // format paragraphs and prose
   story(text) {
      if (!is.empty(text)) {
         if (re.poetry.all.test(text)) {
            // text is entirely a poem or haiku
            text = text.remove(re.poetry.delimiter);

            if (re.haiku.all.test(text)) {
               // haiku
               text = formatHaiku(text, re.haiku.all);
            } else {
               // not hiaku
               text = '<p class="poem">' + text
                     .replace(re.lineBreak, '<br/>')
                     .replace(re.poetry.indent, '<span class="tab"></span>')
                  + '</p>';
            }
         } else if (re.haiku.any.test(text)) {
            // text begins with a haiku
            text = formatHaiku(text, re.haiku.any);
         } else {
            // text has no haiku but may be partially a poem
            text = caption(text);
         }
      }
      return text;
   },

   // HTML tag for icon matched to post tag
   postTagIcon(title) {
      let map = config.style.icon.postTag;

      if (is.value(map)) {
         for (let name in map) { if (name == title) { return icon(map[name]); } }
         if (is.defined(map,'default')) { return icon(map['default']); }
      }
      return '';
   },

   postModeIcon(tags) {
      const icons = config.style.icon;
      const map = icons.post;

      if (!is.array(tags)) { tags = Object.keys(tags); }

      if (is.value(map)) {
         for (let i in map) {
            let re = map[i];
            if (re.test(tags)) {
               re.lastIndex = 0;
               return i;
            }
         }
         if (is.defined(icons,'postDefault')) { return icons.postDefault; }
      }
      return '';
   },

   // view template helpers
   helpers: {
      formatCaption: text => this.story(text),
      formatTitle: text => typography(text),
      lowerCase: text => text.toLocaleLowerCase(),
      add: (a, b) => (a * 1) + b,
      date: d => exports.date(d),
      subtract: (a, b) => (a * 1) - b,
      plural: count => (count > 1) ? 's' : '',
      //makeSlug: text => exports.slug(text),
      makeTagList: list => exports.tagList(list),
      formatLogTime: text => exports.logTime(text),
      /** @type {Date} d */
      formatISO8601: d => d.toISOString(),
      formatFraction: text => exports.fraction(text),
      mapHeight: (width, height) => height > width ? config.style.map.maxInlineHeight : height,
      icon: name => icon(name),
      iconForPostTag: title => exports.postTagIcon(title),
      modeIconForPost: tags => exports.postModeIcon(tags),
      rot13: text => exports.rot13(text),
      encode: text => encodeURIComponent(text)
   }
};

// http://www.w3.org/TR/html4/sgml/entities.html
const htmlEntity = {
   34: 'quot',
   38: 'amp',
   39: 'apos',
   60: 'lt',
   62: 'gt',
   160: 'nbsp',
   161: 'iexcl',
   162: 'cent',
   163: 'pound',
   164: 'curren',
   165: 'yen',
   166: 'brvbar',
   167: 'sect',
   168: 'uml',
   169: 'copy',
   170: 'ordf',
   171: 'laquo',
   172: 'not',
   173: 'shy',
   174: 'reg',
   175: 'macr',
   176: 'deg',
   177: 'plusmn',
   178: 'sup2',
   179: 'sup3',
   180: 'acute',
   181: 'micro',
   182: 'para',
   183: 'middot',
   184: 'cedil',
   185: 'sup1',
   186: 'ordm',
   187: 'raquo',
   188: 'frac14',
   189: 'frac12',
   190: 'frac34',
   191: 'iquest',
   192: 'Agrave',
   193: 'Aacute',
   194: 'Acirc',
   195: 'Atilde',
   196: 'Auml',
   197: 'Aring',
   198: 'AElig',
   199: 'Ccedil',
   200: 'Egrave',
   201: 'Eacute',
   202: 'Ecirc',
   203: 'Euml',
   204: 'Igrave',
   205: 'Iacute',
   206: 'Icirc',
   207: 'Iuml',
   208: 'ETH',
   209: 'Ntilde',
   210: 'Ograve',
   211: 'Oacute',
   212: 'Ocirc',
   213: 'Otilde',
   214: 'Ouml',
   215: 'times',
   216: 'Oslash',
   217: 'Ugrave',
   218: 'Uacute',
   219: 'Ucirc',
   220: 'Uuml',
   221: 'Yacute',
   222: 'THORN',
   223: 'szlig',
   224: 'agrave',
   225: 'aacute',
   226: 'acirc',
   227: 'atilde',
   228: 'auml',
   229: 'aring',
   230: 'aelig',
   231: 'ccedil',
   232: 'egrave',
   233: 'eacute',
   234: 'ecirc',
   235: 'euml',
   236: 'igrave',
   237: 'iacute',
   238: 'icirc',
   239: 'iuml',
   240: 'eth',
   241: 'ntilde',
   242: 'ograve',
   243: 'oacute',
   244: 'ocirc',
   245: 'otilde',
   246: 'ouml',
   247: 'divide',
   248: 'oslash',
   249: 'ugrave',
   250: 'uacute',
   251: 'ucirc',
   252: 'uuml',
   253: 'yacute',
   254: 'thorn',
   255: 'yuml',
   402: 'fnof',
   913: 'Alpha',
   914: 'Beta',
   915: 'Gamma',
   916: 'Delta',
   917: 'Epsilon',
   918: 'Zeta',
   919: 'Eta',
   920: 'Theta',
   921: 'Iota',
   922: 'Kappa',
   923: 'Lambda',
   924: 'Mu',
   925: 'Nu',
   926: 'Xi',
   927: 'Omicron',
   928: 'Pi',
   929: 'Rho',
   931: 'Sigma',
   932: 'Tau',
   933: 'Upsilon',
   934: 'Phi',
   935: 'Chi',
   936: 'Psi',
   937: 'Omega',
   945: 'alpha',
   946: 'beta',
   947: 'gamma',
   948: 'delta',
   949: 'epsilon',
   950: 'zeta',
   951: 'eta',
   952: 'theta',
   953: 'iota',
   954: 'kappa',
   955: 'lambda',
   956: 'mu',
   957: 'nu',
   958: 'xi',
   959: 'omicron',
   960: 'pi',
   961: 'rho',
   962: 'sigmaf',
   963: 'sigma',
   964: 'tau',
   965: 'upsilon',
   966: 'phi',
   967: 'chi',
   968: 'psi',
   969: 'omega',
   977: 'thetasym',
   978: 'upsih',
   982: 'piv',
   8226: 'bull',
   8230: 'hellip',
   8242: 'prime',
   8243: 'Prime',
   8254: 'oline',
   8260: 'frasl',
   8472: 'weierp',
   8465: 'image',
   8476: 'real',
   8482: 'trade',
   8501: 'alefsym',
   8592: 'larr',
   8593: 'uarr',
   8594: 'rarr',
   8595: 'darr',
   8596: 'harr',
   8629: 'crarr',
   8656: 'lArr',
   8657: 'uArr',
   8658: 'rArr',
   8659: 'dArr',
   8660: 'hArr',
   8704: 'forall',
   8706: 'part',
   8707: 'exist',
   8709: 'empty',
   8711: 'nabla',
   8712: 'isin',
   8713: 'notin',
   8715: 'ni',
   8719: 'prod',
   8721: 'sum',
   8722: 'minus',
   8727: 'lowast',
   8730: 'radic',
   8733: 'prop',
   8734: 'infin',
   8736: 'ang',
   8743: 'and',
   8744: 'or',
   8745: 'cap',
   8746: 'cup',
   8747: 'int',
   8756: 'there4',
   8764: 'sim',
   8773: 'cong',
   8776: 'asymp',
   8800: 'ne',
   8801: 'equiv',
   8804: 'le',
   8805: 'ge',
   8834: 'sub',
   8835: 'sup',
   8836: 'nsub',
   8838: 'sube',
   8839: 'supe',
   8853: 'oplus',
   8855: 'otimes',
   8869: 'perp',
   8901: 'sdot',
   8968: 'lceil',
   8969: 'rceil',
   8970: 'lfloor',
   8971: 'rfloor',
   9001: 'lang',
   9002: 'rang',
   9674: 'loz',
   9824: 'spades',
   9827: 'clubs',
   9829: 'hearts',
   9830: 'diams',
   338: 'OElig',
   339: 'oelig',
   352: 'Scaron',
   353: 'scaron',
   376: 'Yuml',
   710: 'circ',
   732: 'tilde',
   8194: 'ensp',
   8195: 'emsp',
   8201: 'thinsp',
   8204: 'zwnj',
   8205: 'zwj',
   8206: 'lrm',
   8207: 'rlm',
   8211: 'ndash',
   8212: 'mdash',
   8216: 'lsquo',
   8217: 'rsquo',
   8218: 'sbquo',
   8220: 'ldquo',
   8221: 'rdquo',
   8222: 'bdquo',
   8224: 'dagger',
   8225: 'Dagger',
   8240: 'permil',
   8249: 'lsaquo',
   8250: 'rsaquo',
   8364: 'euro'
};