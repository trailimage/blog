"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const constants_1 = require("../constants");
const is_1 = require("../is");
const number_1 = require("./number");
const text_1 = require("./text");
exports.hourOfDay = (h) => (h > 12) ? 'PM ' + (h - 12) : 'AM ' + h;
exports.toDateString = (d) => constants_1.month[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
function toLogTime(text) {
    const d = new Date(text);
    if (config_1.default.isProduction) {
        d.setHours(d.getHours() - 6);
    }
    return text_1.format('{0}/{1} {2} {3}:{4}:{5}.{6}', d.getMonth() + 1, d.getDate(), constants_1.weekday[d.getDay()], exports.hourOfDay(d.getHours()), number_1.leadingZeros(d.getMinutes(), 2), number_1.leadingZeros(d.getSeconds(), 2), number_1.leadingZeros(d.getMilliseconds(), 3));
}
exports.toLogTime = toLogTime;
function inDaylightSavings(date = new Date()) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const nonDstOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    return date.getTimezoneOffset() < nonDstOffset;
}
exports.inDaylightSavings = inDaylightSavings;
exports.timeZoneOffset = (date = new Date()) => config_1.default.timeZone + (inDaylightSavings(date) ? 1 : 0);
function parseDate(text) {
    const parts = text.split(' ');
    const date = parts[0].split('-').map(d => parseInt(d));
    const time = parts[1].split(':').map(d => parseInt(d));
    const h = time[0] - config_1.default.timeZone;
    const d = new Date(Date.UTC(date[0], date[1] - 1, date[2], h, time[1], time[2]));
    if (inDaylightSavings(d)) {
        d.setHours(d.getHours() - 1);
    }
    return d;
}
exports.parseDate = parseDate;
function fromTimeStamp(timestamp) {
    if (is_1.default.date(timestamp)) {
        return timestamp;
    }
    else if (is_1.default.text(timestamp)) {
        timestamp = number_1.parseNumber(timestamp);
    }
    return new Date(timestamp * 1000);
}
exports.fromTimeStamp = fromTimeStamp;
exports.iso8601time = (timestamp) => fromTimeStamp(timestamp).toISOString();
function hoursAndMinutes(hours) {
    const h = Math.floor(hours);
    const m = hours - h;
    return h + ':' + number_1.leadingZeros(Math.round(60 * m), 2);
}
exports.hoursAndMinutes = hoursAndMinutes;
//# sourceMappingURL=time.js.map