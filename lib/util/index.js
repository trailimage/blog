"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@toba/utility");
const is_1 = require("../is");
const text_1 = require("./text");
const html_1 = require("./html");
const time_1 = require("./time");
exports.default = {
    format: utility_1.format,
    logMessage: html_1.logMessage,
    topDomain: text_1.topDomain,
    IPv6: text_1.IPv6,
    slug: utility_1.slug,
    capitalize: utility_1.capitalize,
    titleCase: utility_1.titleCase,
    date: {
        fromTimeStamp: time_1.fromTimeStamp,
        hoursAndMinutes: utility_1.hoursAndMinutes,
        hourOfDay: time_1.hourOfDay,
        inDaylightSavings: utility_1.inDaylightSavings,
        iso8601time: time_1.iso8601time,
        parse: time_1.parseDate,
        timeZoneOffset: time_1.timeZoneOffset,
        toString: utility_1.dateString,
        toLogTime: time_1.toLogTime
    },
    encode: {
        rot13: utility_1.rot13,
        toBase64: text_1.encodeBase64,
        fromBase64: text_1.decodeBase64,
        characterEntities: html_1.characterEntities
    },
    html: {
        typography: html_1.typography,
        caption: html_1.caption,
        fixMalformedLink: html_1.fixMalformedLink,
        fraction: html_1.fraction,
        photoTagList: html_1.photoTagList,
        shortenLinkText: html_1.shortenLinkText,
        story: html_1.story
    },
    icon: {
        tag: html_1.iconTag,
        mode: html_1.postModeIcon,
        category: html_1.postCategoryIcon
    },
    number: {
        say: utility_1.sayNumber,
        pad: utility_1.leadingZeros,
        parse: utility_1.parseNumber,
        maybe: utility_1.maybeNumber
    },
    shuffle(a) {
        if (!is_1.default.array(a) || a.length === 0) {
            return null;
        }
        let i = a.length;
        while (--i) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
        return a;
    }
};
//# sourceMappingURL=index.js.map