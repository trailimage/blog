"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const xml_1 = require("./xml");
const xmldom_1 = require("xmldom");
const _1 = require("./");
const _2 = require("../util/");
const JSZip = require("jszip");
function coordinates(node, name) {
    const lines = node.getElementsByTagName(name);
    if (lines != null && lines.length > 0) {
        const segments = [];
        for (let i = 0; i < lines.length; i++) {
            const coordinates = xml_1.default.firstValue(lines[i], 'coordinates');
            if (coordinates != null) {
                const locations = [];
                const points = coordinates.trim().split(' ');
                points.forEach(p => {
                    const location = [];
                    const parts = p.split(',').map(roundFromString(6));
                    if (parts.length >= 2) {
                        location[_1.default.LON] = parts[0];
                        location[_1.default.LAT] = parts[1];
                        if (parts.length >= 3) {
                            location[_1.default.ELEVATION] = parts[2];
                        }
                        locations.push(location);
                    }
                });
                if (locations.length > 0) {
                    segments.push(locations);
                }
            }
        }
        if (segments.length > 0) {
            return segments;
        }
    }
    return null;
}
const roundFromString = (places) => (n) => parseFloat(parseFloat(n).toFixed(places));
function location(node) {
    const locations = coordinates(node, 'Point');
    if (locations != null && locations.length > 0) {
        if (locations.length > 1) {
            return locations[0][0];
        }
        else {
            return locations[0][0];
        }
    }
    return null;
}
function line(node) {
    const l = coordinates(node, 'LineString');
    return l == null || l.length == 0 ? null : l;
}
function parseDescription(properties) {
    if (/<html/.test(properties.description)) {
        const source = properties.description
            .replace(/^<\!\[CDATA\[/, '')
            .replace(/\]\]>$/, '');
        let html = null;
        try {
            html = new xmldom_1.DOMParser().parseFromString(source);
        }
        catch (ex) {
            return properties;
        }
        const tables = html.getElementsByTagName('table');
        const clean = (text) => is_1.default.value(text)
            ? text.replace(/[\r\n]/g, '').replace('&lt;Null&gt;', '').replace('<Null>', '')
            : null;
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
                const cols = rows[i].getElementsByTagName('td');
                const key = clean(xml_1.default.value(cols[0]));
                const value = _2.default.number.maybe(clean(xml_1.default.value(cols[1])));
                if (key && value) {
                    properties[key.replace(' ', '_')] = value;
                }
            }
            delete properties['description'];
        }
    }
    return properties;
}
function fromKMZ(data) {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        zip.loadAsync(data).then(archive => {
            for (const name in archive.files) {
                if (name.endsWith('.kml')) {
                    archive.files[name].async('string').then(text => {
                        try {
                            resolve(new xmldom_1.DOMParser().parseFromString(text));
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    });
                    return;
                }
            }
            reject('No readable KML found in archive');
        });
    });
}
function properties(node, extras = []) {
    const names = extras.concat(['name', 'description']);
    const properties = {};
    for (const key of names) {
        let value = xml_1.default.firstValue(node, key);
        if (!is_1.default.empty(value)) {
            switch (key) {
                case 'name':
                    value = _2.default.titleCase(value);
                    break;
            }
            properties[key] = _2.default.number.maybe(value);
        }
    }
    delete properties['description'];
    return parseDescription(properties);
}
exports.default = { properties, location, line, fromKMZ, parseDescription };
//# sourceMappingURL=kml.js.map