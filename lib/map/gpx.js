"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const is_1 = require("../is");
const xml_1 = require("./xml");
const measure_1 = require("./measure");
const _1 = require("./");
function location(node) {
    const location = new Array(5);
    const elevation = xml_1.default.firstNode(node, 'ele');
    const t = xml_1.default.firstNode(node, 'time');
    location[_1.default.LON] = xml_1.default.numberAttribute(node, 'lon');
    location[_1.default.LAT] = xml_1.default.numberAttribute(node, 'lat');
    if (config_1.default.map.checkPrivacy &&
        measure_1.default.pointDistance(location, config_1.default.map.privacyCenter) <
            config_1.default.map.privacyMiles) {
        return null;
    }
    if (is_1.default.value(elevation)) {
        const m = parseFloat(xml_1.default.value(elevation));
        location[_1.default.ELEVATION] = Math.round(m * 3.28084);
    }
    if (is_1.default.value(t)) {
        const d = new Date(xml_1.default.value(t));
        location[_1.default.TIME] = d.getTime();
    }
    location[_1.default.SPEED] = 0;
    return location;
}
exports.location = location;
function properties(node, extras = []) {
    const names = extras.concat([
        'name',
        'desc',
        'author',
        'copyright',
        'link',
        'time',
        'keywords'
    ]);
    const properties = {};
    for (const key of names) {
        const value = xml_1.default.firstValue(node, key);
        if (!is_1.default.empty(value)) {
            properties[key] = value;
        }
    }
    return properties;
}
exports.properties = properties;
exports.line = (node, name) => Array.from(node.getElementsByTagName(name))
    .map(p => location(p))
    .filter(p => is_1.default.value(p))
    .map((p, i, line) => {
    if (i > 0) {
        p[_1.default.SPEED] = measure_1.default.speed(p, line[i - 1]);
    }
    return p;
});
exports.default = { location, line: exports.line, properties };
//# sourceMappingURL=gpx.js.map