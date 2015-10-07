'use strict';

/**
 * Use getters to return new instances of global flagged patterns so lastIndex isn't an issue
 */
module.exports = {
	/**
	 * @example Video (960x720): <a href="http://youtu.be/obCgu3yJ4uw" rel="nofollow">youtu.be/obCgu3yJ4uw</a>
	 */
	get video() { return /Video(\s*\((\d+)[x×](\d+)\))?:\s*<a[^>]+>[^\/]+\/([\w\-_]+)<\/a>/gi; },
	url: /(http:\/\/[^\s\r\n]+)/g,
	/**
	 * Facebook album ID to be inserted into Enum.url.facebookAlbum
	 * @example 296706240428897.53174
	 * @example 296706240428897.53174
	 */
	facebookID: /\d{15}\.\d{5}/g,
	/**
	 * @see http://www.regular-expressions.info/regexbuddy/email.html
	 * @type {RegExp}
	 */
	email: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi,
	machineTag: /=/g,
	/**
	 * Match the first HTML paragraph if it's short and contains a quote
	 * @type {RegExp}
	 */
	quip: /(<p>)(“(?=[^<]*”)[^<]{4,80}<\/p>)/i,
	/**
	 * @returns {RegExp}
	 */
	get artist() { return /(Abbott|Wright|Bowman|Thomas|Reed)/gi; },
	queryString: /\?.+$/,
	fileExt: /\.\w{2,4}$/,
	get newLine() { return /(\r\n|\n|\r)/gm; },
	get trailingWhiteSpace() { return /[\r\n\s]*$/g; },
	get lineBreak() { return /\r*\n/gi; },
	footnote: {
		/**
		 * Match superscripts but don't match atomic numbers
		 * Capture footnoted word and superscript
		 * @returns {RegExp}
		 */
		get number() { return /([^\/\s])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?!\w)/g; },
		/**
		 * Footnotes are always preceded by three underscores
		 * newlines have been replaced by paragraph tages when this pattern is applied
		 * @returns {RegExp}
		 */
		get text() { return /(<p>_{3}<\/p>)(.+)$/gm; }
	},
	quote: {
		get rightSingle() { return /(\w)'/g; },
		get leftSingle() { return /\b'(\w)/g; },
		get rightDouble() { return /(\w)("|&quot;)/g; },
		get leftDouble() { return /("|&quot;)(\w)/g; },
		get open() { return /^\s*["“]/g; },
		/**
		 * Curly or straight end quote plus optional footnote superscript
		 * @returns {RegExp}
		 */
		get end() { return /["”]\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]?\s*$/g; },
		/**
		 * Curly or straight quote characters
		 * @returns {RegExp}
		 */
		get any() { return /["“”]/g; },
		get curly() { return /[“”]/g; },
		get html() { return /(&ldquo;|&rdquo;)/g; },
		/**
		 * Long quote followed by line break
		 * @returns {RegExp}
		 */
		//get block() { return /[\r\n]*(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*[\r\n]/g; }
		block: /[\r\n]*(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*[\r\n]/g
	},
	tag: {
		/**
		 * Link with HTML encoded attribute quotes
		 * Capture opening link tag and link text
		 * @returns {RegExp}
		 */
		get encodedLink() { return /(<a [^>]+>)([^<]+)<\/a>/gi; },
		/**
		 * Capture URL and link text
		 * @returns {RegExp}
		 */
		get link() { return  /<a href=["']([^"']+)['"][^>]*>([^<]+)<\/a>/gi; },
		/**
		 * Flickr prematurely closes link tags around text with parentheses
		 * Capture the wrongly excluded part of the URL
		 * @example Newsletter, No. 2: <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
		 * @example <a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf
		 * @returns {RegExp}
		 */
		get truncatedLink() { return /<\/a>(\([\w\/\.\-%\)\(]+)/gi; },
		anchor: /#\w+$/
	},
	poetry: {
		/**
		 * Full poems have dash above and below
		 * @type {RegExp}
		 */
		get delimiter() { return  /(^|[\r\n])-([\r\n]|$)/g; },
		/**
		 * Whether text is entirely a poem
		 * Uses dashes above and below to set off full poem — hacky but haven't figured out better way
		 * @returns {RegExp}
		 */
		get all() { return /^\-[\r\n](([^\r\n]){3,100}([\r\n])+){3,}\-[\r\n]*$/gi; },
		/**
		 * Whether text contains a poem
		 * Exclude dialog by negating comma or question mark before closing quote unless its footnoted
		 * Capture leading space and poem body
		 * @returns {RegExp}
		 */
		//get any() { return /(^|[\r\n]{1,2})((([^\r\n](?![,?]”[⁰¹²³⁴⁵⁶⁷⁸⁹])){4,80}[\r\n]{1,2}){3,})/gi; },
		get any() { return /(^|[\r\n]{1,2})((([^\r\n](?![,!?]”)){4,80}[\r\n]{1,2}){3,})/gi; },
		/**
		 * Spaces are collapsed by Flickr so poems are indented with hard spaces and bullets
		 * @returns {RegExp}
		 */
		get indent() { return /· · /g; }
	},
	/**
	 * Three lines of text 5–100 characters long
	 */
	haiku: {
		/**
		 * Whether text begins with a haiku
		 * @returns {RegExp}
		 */
		get any() { return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})([\r\n]{2}|$)+/gi; },
		/**
		 * Whether text is entirely haiku
		 * @returns {RegExp}
		 */
		get all() { return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})$/gi }
	}
};