"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const regex_1 = require("../regex");
const config_1 = require("../config");
const constants_1 = require("./constants");
function story(text) {
    if (tools_1.is.empty(text)) {
        return text;
    }
    if (regex_1.default.poetry.all.test(text)) {
        text = text.replace(regex_1.default.poetry.delimiter, '');
        if (regex_1.default.haiku.all.test(text)) {
            text = formatHaiku(text, regex_1.default.haiku.all);
        }
        else {
            text =
                '<p class="poem">' +
                    text
                        .replace(regex_1.default.lineBreak, '<br/>')
                        .replace(regex_1.default.poetry.indent, '<span class="tab"></span>') +
                    '</p>';
        }
    }
    else if (regex_1.default.haiku.any.test(text)) {
        text = formatHaiku(text, regex_1.default.haiku.any);
    }
    else {
        text = caption(text);
    }
    return text;
}
exports.story = story;
function fixMalformedLink(text) {
    let index = 0;
    text = text.replace(regex_1.default.tag.truncatedLink, (_match, missedPart, i) => {
        index = i;
        return missedPart + '</a>';
    });
    if (index > 0) {
        const protocol = /https?:\/\//;
        const oldLink = text.substring(text.lastIndexOf('<a', index), text.indexOf('</a>', index) + 4);
        const newLink = oldLink.replace(regex_1.default.tag.link, (_match, _url, name) => {
            if (!protocol.test(name)) {
                name = 'http://' + name;
            }
            return tools_1.format('<a href="{0}">{1}</a>', name, decodeURI(name.replace(protocol, '')));
        });
        text = text.replace(oldLink, newLink);
    }
    else {
        text = text.replace(regex_1.default.tag.ellipsisLink, '<a href="$1$2$3">$2$3</a>');
    }
    return text;
}
exports.fixMalformedLink = fixMalformedLink;
exports.shortenLinkText = (text) => text.replace(regex_1.default.tag.linkToUrl, (_match, protocol, url) => {
    const parts = url.split('/');
    const domain = parts[0].replace('www.', '');
    let lastPart = /\/$/.test(url) ? parts.length - 2 : parts.length - 1;
    if (lastPart > 0 && /^[\?#]/.test(parts[lastPart])) {
        lastPart--;
    }
    let middle = '/';
    const page = parts[lastPart]
        .replace(regex_1.default.queryString, '')
        .replace(regex_1.default.tag.anchor, '')
        .replace(regex_1.default.fileExt, '');
    if (lastPart > 1) {
        middle = '/&hellip;/';
    }
    if (protocol === undefined) {
        protocol = 'http://';
    }
    return ('<a href="' +
        protocol +
        url +
        '">' +
        domain +
        middle +
        decodeURIComponent(page) +
        '</a>');
});
exports.fraction = (text) => text.replace(/(\d+)\/(\d+)/, '<sup>$1</sup>&frasl;<sub>$2</sub>');
exports.typography = (text) => tools_1.is.empty(text)
    ? ''
    : text
        .replace(regex_1.default.quote.rightSingle, '$1&rsquo;')
        .replace(regex_1.default.quote.leftSingle, '&lsquo;$1')
        .replace(regex_1.default.quote.rightDouble, '$1&rdquo;')
        .replace(regex_1.default.quote.leftDouble, '&ldquo;$2')
        .replace(regex_1.default.tag.encodedLink, (_match, tag, name) => tag.replace(regex_1.default.quote.html, '"') + name + '</a>');
function photoTagList(list) {
    let links = '';
    const link = `<a href="/photo-tag/{0}" rel="${tools_1.LinkRelation.Tag}">{1}</a>`;
    if (list instanceof Set) {
        list = Array.from(list);
    }
    if (tools_1.is.array(list)) {
        list.sort().forEach(t => {
            links += tools_1.format(link, t.toLowerCase().replace(/\W/g, ''), t) + ' ';
        });
    }
    return links;
}
exports.photoTagList = photoTagList;
const iconTag = (name) => `<i class="material-icons ${name}">${name}</i>`;
function categoryIcon(title) {
    const map = config_1.config.style.icon.category;
    if (tools_1.is.value(map)) {
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
function travelModeIcon(categories) {
    const icons = config_1.config.style.icon;
    const map = icons.mode;
    if (!tools_1.is.array(categories)) {
        categories = Object.keys(categories);
    }
    if (tools_1.is.value(map)) {
        const iconName = Object.keys(map).find(iconName => {
            const re = map[iconName];
            return categories.find(c => re.test(c)) !== undefined;
        });
        if (tools_1.is.value(iconName)) {
            return iconName;
        }
        else if (icons.defaultMode) {
            return icons.defaultMode;
        }
    }
    return '';
}
function linkPattern(url) {
    return `<a href="${url}$1" target="_blank">$1</a>`;
}
exports.linkPattern = linkPattern;
function formatNotes(notes) {
    const start = /^\s*\*/g.test(notes) ? ' start="0"' : '';
    notes =
        '<ol class="footnotes"' +
            start +
            '><li><span>' +
            notes
                .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*/g, '')
                .replace(/[\r\n]+/g, '</span></li><li><span>')
                .replace(/<\/span><\/li><li><span>\s*$/, '') +
            '</span></li></ol>';
    return notes.replace(/<li><span>\s*\*\s*/gi, '<li class="credit">' + iconTag('star') + '<span>');
}
exports.formatNotes = formatNotes;
function formatHaiku(text, regex) {
    const match = regex.exec(text);
    return ('<p class="haiku">' +
        match[1] +
        '<br/>' +
        match[2] +
        '<br/>' +
        match[3] +
        iconTag('spa') +
        '</p>' +
        caption(text.replace(match[0], '')));
}
exports.formatHaiku = formatHaiku;
function formatPoem(text) {
    return ('<blockquote class="poem"><p>' +
        text
            .replace(regex_1.default.trailingWhiteSpace, '')
            .replace(regex_1.default.lineBreak, '<br/>')
            .replace(/(<br\/>){2,}/gi, '</p><p>')
            .replace(regex_1.default.poetry.indent, '<span class="tab"></span>')
            .replace(regex_1.default.footnote.number, '$1<sup>$2</sup>') +
        '</p></blockquote>');
}
function caption(text) {
    if (!tools_1.is.empty(text)) {
        const ph = '[POEM]';
        let footnotes = '';
        let poem = '';
        text = fixMalformedLink(text);
        text = exports.shortenLinkText(text);
        text = exports.typography(text);
        text = text
            .replace(regex_1.default.footnote.text, (_match, _prefix, body) => {
            footnotes = formatNotes(body);
            return '';
        })
            .replace(regex_1.default.poetry.any, (_match, _space, body) => {
            poem = formatPoem(body);
            return ph;
        })
            .replace(regex_1.default.quote.block, (_match, _newLines, body) => '[Q]' + body.replace(regex_1.default.quote.curly, '') + '[/Q]');
        text = '<p>' + text + '</p>';
        text = text
            .replace(regex_1.default.newLine, '</p><p>')
            .replace(regex_1.default.tag.emptyParagraph, '')
            .replace(regex_1.default.quip, (_match, _tag, body) => '<p class="quip">' + body)
            .replace(regex_1.default.footnote.number, '$1<sup>$2</sup>')
            .replace(/\[\/Q][\r\n\s]*([^<]+)/g, '[/Q]<p class="first">$1')
            .replace(/(<p>)?\[Q]/g, '<blockquote><p>')
            .replace(/\[\/Q](<\/p>)?/g, '</p></blockquote>');
        if (poem.length > 0) {
            text = text
                .replace(ph, '</p>' + poem + '<p class="first">')
                .replace(regex_1.default.tag.emptyParagraph, '');
        }
        return text + footnotes;
    }
    return '';
}
exports.characterEntities = (text) => text.replace(/[\u00A0-\u2666<>\&]/g, c => '&' + (constants_1.htmlEntity[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';');
exports.html = {
    story,
    typography: exports.typography,
    caption,
    formatPoem,
    formatHaiku,
    photoTagList,
    fixMalformedLink,
    shortenLinkText: exports.shortenLinkText,
    fraction: exports.fraction,
    icon: {
        category: categoryIcon,
        mode: travelModeIcon,
        tag: iconTag
    }
};
