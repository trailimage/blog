"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
exports.default = {
    get video() { return /Video(\s*\((\d+)[x×](\d+)\))?:\s*<a[^>]+>[^\/]+\/([\w\-_]+)<\/a>/gi; },
    ipAddress: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/,
    url: /(http:\/\/[^\s\r\n]+)/g,
    domain: /[a-z0-9][a-z0-9\-]*[a-z0-9]\.[a-z\.]{2,6}$/i,
    facebookID: /\d{15}\.\d{5}/g,
    email: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi,
    machineTag: /=/g,
    quip: /(<p>)(“(?=[^<]*”)[^<]{4,80}<\/p>)/i,
    get artist() { return new RegExp('(' + config_1.library.artistNames.join('|') + ')', 'gi'); },
    queryString: /\?.+$/,
    fileExt: /\.\w{2,4}$/,
    get newLine() { return /(\r\n|\n|\r)/gm; },
    get trailingWhiteSpace() { return /[\r\n\s]*$/g; },
    get lineBreak() { return /\r*\n/gi; },
    get subtitle() { return new RegExp(config_1.library.subtitleSeparator + '\\s*', 'g'); },
    footnote: {
        get number() { return /([^\/\s])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?!\w)/g; },
        get text() { return /(^|[\r\n]+)_{3}[\r\n]*([\s\S]+)$/gm; }
    },
    quote: {
        get rightSingle() { return /(\w)'/g; },
        get leftSingle() { return /\b'(\w)/g; },
        get rightDouble() { return /([\w,])("|&quot;)/g; },
        get leftDouble() { return /("|&quot;)(\w)/g; },
        get open() { return /^\s*["“]/g; },
        get end() { return /["”]\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]?\s*$/g; },
        get any() { return /["“”]/g; },
        get curly() { return /[“”]/g; },
        get html() { return /(&ldquo;|&rdquo;)/g; },
        block: /(\r\n|\r|\n)?(“[^”]{275,}”[⁰¹²³⁴⁵⁶⁷⁸⁹]*)\s*(\r\n|\r|\n)?/g
    },
    tag: {
        get encodedLink() { return /(<a [^>]+>)([^<]+)<\/a>/gi; },
        get link() { return /<a href=["']([^"']+)['"][^>]*>([^<]+)<\/a>/gi; },
        get linkToUrl() { return /<a href=["'](https?:\/\/)?([^"']+)['"][^>]*>\1?\2<\/a>/gi; },
        get emptyParagraph() { return /<p[^>]*><\/p>/gi; },
        get truncatedLink() { return /<\/a>(\([\w\/\.\-%\)\(]+)/gi; },
        get ellipsisLink() { return /<a href=["'](https?:\/\/)?([^\/]+)([^"']+)['"][^>]*>\2[^<]+\.{3}<\/a>/gi; },
        anchor: /#\w+$/
    },
    poetry: {
        get delimiter() { return /(^|[\r\n]+)-([\r\n]+|$)/g; },
        get all() { return /^\-[\r\n]*(([^\r\n]){3,100}([\r\n])+){3,}\-[\r\n]*$/gi; },
        get any() { return /(^|[\r\n]{1,2})((([^\r\n](?![,!?]”)){4,80}([\r\n]+|$)){3,})/gi; },
        get indent() { return /· · /g; }
    },
    haiku: {
        get any() { return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})([\r\n]{2}|$)+/gi; },
        get all() { return /^([ \w]{5,100})[\r\n]+([ \w]{5,100})[\r\n]+([ \w]{5,100})$/gi; }
    },
    log: {
        path: /^(\/[0-9a-z\/\-]+)(\snot\sfound)/
    }
};
//# sourceMappingURL=regex.js.map