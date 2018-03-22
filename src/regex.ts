import { library } from './config';
import { re } from '@toba/tools';

/**
 * Use getters to return new instances of global flagged patterns so lastIndex
 * isn't an issue
 */
export default {
   ...re,
   /**
    * Extract video link from specially formatted remark in set description.
    * Example:
    *
    *    Video (960x720): <a href="http://youtu.be/obCgu3yJ4uw" rel="nofollow">youtu.be/obCgu3yJ4uw</a>
    */
   get video() {
      return /Video(\s*\((\d+)[x×](\d+)\))?:\s*<a[^>]+>[^\/]+\/([\w\-_]+)<\/a>/gi;
   },

   /**
    * Facebook album ID to be inserted into Enum.url.facebookAlbum. Examples:
    *
    *    296706240428897.53174
    *    296706240428897.53174
    */
   facebookID: /\d{15}\.\d{5}/g,

   machineTag: /=/g,

   /** Match the first HTML paragraph if it's short and contains a quote */
   quip: /(<p>)(“(?=[^<]*”)[^<]{4,80}<\/p>)/i,

   get artist() {
      return new RegExp('(' + library.artistNames.join('|') + ')', 'gi');
   },

   get subtitle() {
      return new RegExp(library.subtitleSeparator + '\\s*', 'g');
   },

   footnote: {
      /**
       * Capture footnoted word and superscript. Match superscripts but don't
       * match atomic numbers.
       */
      get number() {
         return /([^\/\s])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?!\w)/g;
      },
      /** Footnotes are always preceded by three underscores */
      get text() {
         return /(^|[\r\n]+)_{3}[\r\n]*([\s\S]+)$/gm;
      }
   },

   quote: {
      get rightSingle() {
         return /(\w)'/g;
      },
      get leftSingle() {
         return /\b'(\w)/g;
      },
      get rightDouble() {
         return /([\w,])("|&quot;)/g;
      },
      get leftDouble() {
         return /("|&quot;)(\w)/g;
      },
      get open() {
         return /^\s*["“]/g;
      },

      /** Curly or straight end quote plus optional footnote superscript */
      get end() {
         return /["”]\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]?\s*$/g;
      },

      /** Curly or straight quote characters */
      get any() {
         return /["“”]/g;
      },
      get curly() {
         return /[“”]/g;
      },
      get html() {
         return /(&ldquo;|&rdquo;)/g;
      },

      /** Long quote followed by line break */
      block: /(\r\n|\r|\n)(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*(\r\n|\r|\n)?/g
      //get block() { return /[\r\n]*(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*[\r\n]/g; }
   },

   tag: {
      /**
       * Link with HTML encoded attribute quotes. Capture opening link tag and
       * link text.
       */
      get encodedLink() {
         return /(<a [^>]+>)([^<]+)<\/a>/gi;
      },

      /** Capture URL and link text */
      get link() {
         return /<a href=["']([^"']+)['"][^>]*>([^<]+)<\/a>/gi;
      },

      /** Capture URL for links that use the URL itself as the link name */
      get linkToUrl() {
         return /<a href=["'](https?:\/\/)?([^"']+)['"][^>]*>\1?\2<\/a>/gi;
      },

      get emptyParagraph() {
         return /<p[^>]*><\/p>/gi;
      },

      /**
       * Flickr prematurely closes link tags around text with parentheses.
       * Capture the wrongly excluded part of the URL. Examples:
       *
       *    <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
       *    <a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf
       */
      get truncatedLink() {
         return /<\/a>(\([\w\/\.\-%\)\(]+)/gi;
      },

      /**
       * Sites may intentionally truncate link name with ellipsis when the name
       * is a long URL. Example:
       *
       *    <a href="http://idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2" rel="nofollow">idahohistory.cdmhost.com/cdm/singleitem/collection/p16281...</a>
       */
      get ellipsisLink() {
         return /<a href=["'](https?:\/\/)?([^\/]+)([^"']+)['"][^>]*>\2[^<]+\.{3}<\/a>/gi;
      },

      anchor: /#\w+$/
   },

   poetry: {
      /** Full poems have single dash above and below */
      get delimiter() {
         return /(^|[\r\n]+)-([\r\n]+|$)/g;
      },

      /**
       * Whether text is entirely a poem. Uses dashes above and below to set
       * off full poem — hacky but haven't figured out better way.
       */
      get all() {
         return /^\-[\r\n]*(([^\r\n]){3,100}([\r\n])+){3,}\-[\r\n]*$/gi;
      },

      /**
       * Whether text contains a poem. Exclude dialog by negating comma or
       * question mark before closing quote unless its footnoted. Capture
       * leading space and poem body.
       */
      get any() {
         return /(^|[\r\n]{1,2})((([^\r\n](?![,!?]”)){4,80}([\r\n]+|$)){3,})/gi;
      },

      //get any() { return /(^|[\r\n]{1,2})((([^\r\n](?![,?]”[⁰¹²³⁴⁵⁶⁷⁸⁹])){4,80}[\r\n]{1,2}){3,})/gi; },
      //get any() { return /(^|[\r\n]{1,2})((([^\r\n](?![,!?]”)){4,80}[\r\n]{1,2}){3,})/gi; },

      /**
       * Spaces are collapsed by Flickr so poems are indented with hard spaces
       * and bullets.
       */
      get indent() {
         return /· · /g;
      }
   },

   /** Three lines of text 5–100 characters long */
   haiku: {
      /* Whether text begins with a haiku */
      get any() {
         return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})([\r\n]{2}|$)+/gi;
      },
      /* Whether text is entirely haiku */
      get all() {
         return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})$/gi;
      }
   },
   log: {
      path: /^(\/[0-9a-z\/\-]+)(\snot\sfound)/
   }
};
