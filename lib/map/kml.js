"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const xml_1 = require("./xml");
const xmldom_1 = require("xmldom");
const _1 = require("./");
function location(node) {
    const location = new Array(3);
    const point = xml_1.default.firstNode(node, 'Point');
    if (point != null) {
        const coordinates = xml_1.default.firstValue(point, 'coordinates');
        if (coordinates != null) {
            const parts = coordinates.split(',').map(parseFloat);
            location[_1.default.LON] = parts[0];
            location[_1.default.LAT] = parts[1];
            location[_1.default.ELEVATION] = parts[2];
        }
    }
    return location;
}
function parseDescription(properties) {
    if (/^<html/.test(properties.description)) {
        let html = null;
        try {
            html = new xmldom_1.DOMParser().parseFromString(properties.description);
        }
        catch (ex) {
            return properties;
        }
        const tables = html.getElementsByTagName('table');
        let most = 0;
        let index = -1;
        for (let i = 0; i < tables.length; i++) {
            const t = tables[i];
            if (t.childNodes.length > most) {
                most = t.childNodes.length;
                index = i;
            }
        }
        if (index > 0) {
            const rows = tables[index].getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const r = rows[i];
                properties[xml_1.default.value(r.firstChild)] = xml_1.default.value(r.lastChild);
            }
            delete properties['description'];
        }
    }
    return properties;
}
function properties(node, extras = []) {
    const names = extras.concat(['name', 'description']);
    const properties = {};
    for (const key of names) {
        const value = xml_1.default.firstValue(node, key);
        if (!is_1.default.empty(value)) {
            properties[key] = value;
        }
    }
    return parseDescription(properties);
}
exports.default = { properties, location };
//# sourceMappingURL=kml.js.map