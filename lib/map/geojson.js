"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const gpx_1 = require("./gpx");
const kml_1 = require("./kml");
const _1 = require("./");
const config_1 = require("../config");
const measure_1 = require("./measure");
const transform_1 = require("./transform");
const xmldom_1 = require("xmldom");
exports.type = {
    FEATURE: 'Feature',
    COLLECTION: 'FeatureCollection',
    POINT: 'Point',
    LINE: 'LineString',
    MULTILINE: 'MultiLineString'
};
exports.features = () => ({
    type: exports.type.COLLECTION,
    features: []
});
exports.geometry = (type, coordinates) => ({
    type,
    coordinates
});
function trackFromGPX(node) {
    let count = 0;
    let topSpeed = 0;
    let totalTime = 0;
    let totalSpeed = 0;
    let totalDistance = 0;
    const track = Array.from(node.getElementsByTagName('trkseg'))
        .map(segment => gpx_1.default.line(segment, 'trkpt'))
        .filter(line => line[0].length > 0)
        .map(line => {
        totalTime += measure_1.default.duration(line);
        totalDistance += measure_1.default.length(line);
        return measure_1.default.simplify(line.map(point => {
            const speed = point[_1.default.SPEED];
            if (config_1.default.map.maxPossibleSpeed === 0 ||
                speed < config_1.default.map.maxPossibleSpeed) {
                count++;
                totalSpeed += speed;
                if (speed > topSpeed) {
                    topSpeed = parseFloat(speed.toFixed(1));
                }
            }
            return point.slice(0, 3);
        }));
    });
    return track.length === 0 || track[0].length === 0
        ? null
        : {
            type: 'Feature',
            properties: Object.assign(gpx_1.default.properties(node), {
                topSpeed: topSpeed,
                avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
                duration: totalTime,
                distance: parseFloat(totalDistance.toFixed(2))
            }),
            geometry: track.length === 1
                ? exports.geometry(exports.type.LINE, track[0])
                : exports.geometry(exports.type.MULTILINE, track)
        };
}
const routeFromGPX = (node) => ({
    properties: gpx_1.default.properties(node),
    geometry: exports.geometry(exports.type.LINE, gpx_1.default.line(node, 'rtept'))
});
const pointFromGPX = (node) => ({
    type: exports.type.FEATURE,
    properties: gpx_1.default.properties(node, ['sym']),
    geometry: exports.geometry(exports.type.POINT, gpx_1.default.location(node))
});
function lineFromKML(node) {
    const lines = kml_1.default.line(node);
    if (lines != null) {
        if (lines.length > 1) {
            return {
                type: exports.type.FEATURE,
                properties: kml_1.default.properties(node),
                geometry: exports.geometry(exports.type.MULTILINE, lines)
            };
        }
        else {
            return {
                type: exports.type.FEATURE,
                properties: kml_1.default.properties(node),
                geometry: exports.geometry(exports.type.LINE, lines[0])
            };
        }
    }
}
function featuresFromGPX(gpxString) {
    const geo = exports.features();
    let gpx = null;
    try {
        gpx = new xmldom_1.DOMParser().parseFromString(gpxString);
    }
    catch (ex) {
        logger_1.default.error(ex.toString());
        return null;
    }
    const tracks = parseNodes(gpx, 'trk', trackFromGPX);
    const routes = parseNodes(gpx, 'rte', routeFromGPX);
    const points = parseNodes(gpx, 'wpt', pointFromGPX);
    geo.features = geo.features.concat(tracks, routes, points);
    return geo;
}
exports.featuresFromGPX = featuresFromGPX;
exports.pointFromPhoto = (photo, partKey) => {
    const properties = { url: photo.size.preview.url };
    if (partKey !== undefined) {
        properties.title = photo.title;
        properties.partKey = partKey;
    }
    return {
        type: exports.type.FEATURE,
        properties,
        geometry: exports.geometry(exports.type.POINT, [photo.longitude, photo.latitude])
    };
};
function parseNodes(doc, name, parser) {
    return Array.from(doc.getElementsByTagName(name))
        .map(parser)
        .filter(f => is_1.default.value(f));
}
exports.featuresFromKML = (sourceName) => (kml) => {
    const geo = exports.features();
    let doc = null;
    if (is_1.default.text(kml)) {
        kml = kml.replace(/[\r\n]/g, '').replace(/>\s+</g, '><');
        try {
            doc = new xmldom_1.DOMParser().parseFromString(kml);
        }
        catch (ex) {
            logger_1.default.error(ex.toString());
            return null;
        }
    }
    else {
        doc = kml;
    }
    const lines = parseNodes(doc, 'Placemark', lineFromKML);
    geo.features = postProcess(sourceName, geo.features.concat(lines));
    return geo;
};
function postProcess(sourceName, features) {
    const tx = transform_1.default[sourceName];
    if (tx) {
        features.map(f => {
            f.properties = tx(f.properties);
        });
    }
    return features;
}
exports.default = {
    type: exports.type,
    features: exports.features,
    geometry: exports.geometry,
    pointFromPhoto: exports.pointFromPhoto,
    featuresFromGPX,
    featuresFromKML: exports.featuresFromKML
};
//# sourceMappingURL=geojson.js.map