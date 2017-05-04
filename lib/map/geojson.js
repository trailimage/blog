"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const gpx_1 = require("./gpx");
const kml_1 = require("./kml");
const _1 = require("./");
const config_1 = require("../config");
const measure_1 = require("./measure");
const xmldom_1 = require("xmldom");
const type = {
    FEATURE: 'Feature',
    COLLECTION: 'FeatureCollection',
    POINT: 'Point',
    LINE: 'LineString',
    MULTILINE: 'MultiLineString'
};
const features = () => ({
    type: type.COLLECTION,
    features: []
});
const geometry = (type, coordinates) => ({
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
            if (config_1.default.map.maxPossibleSpeed === 0 || speed < config_1.default.map.maxPossibleSpeed) {
                count++;
                totalSpeed += speed;
                if (speed > topSpeed) {
                    topSpeed = parseFloat(speed.toFixed(1));
                }
            }
            return point.slice(0, 3);
        }));
    });
    return (track.length === 0 || track[0].length === 0) ? null : {
        type: 'Feature',
        properties: Object.assign(gpx_1.default.properties(node), {
            topSpeed: topSpeed,
            avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
            duration: totalTime,
            distance: parseFloat(totalDistance.toFixed(2))
        }),
        geometry: (track.length === 1)
            ? geometry(type.LINE, track[0])
            : geometry(type.MULTILINE, track)
    };
}
const routeFromGPX = (node) => ({
    properties: gpx_1.default.properties(node),
    geometry: geometry(type.LINE, gpx_1.default.line(node, 'rtept'))
});
const pointFromGPX = (node) => ({
    type: type.FEATURE,
    properties: gpx_1.default.properties(node, ['sym']),
    geometry: geometry(type.POINT, gpx_1.default.location(node))
});
function pointFromKML(node) {
    const location = kml_1.default.location(node);
    return (location == null) ? null : {
        type: type.FEATURE,
        properties: kml_1.default.properties(node, ['sym']),
        geometry: geometry(type.POINT, location)
    };
}
function routeFromKML(node) {
    const line = kml_1.default.line(node);
    return (line == null) ? null : {
        properties: kml_1.default.properties(node),
        geometry: geometry(type.LINE, line)
    };
}
function featuresFromGPX(gpxString) {
    const geo = features();
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
const pointFromPhoto = (photo, partKey) => {
    const properties = { url: photo.size.preview.url };
    if (partKey !== undefined) {
        properties.title = photo.title;
        properties.partKey = partKey;
    }
    return {
        type: type.FEATURE,
        properties,
        geometry: geometry(type.POINT, [photo.longitude, photo.latitude])
    };
};
function parseNodes(doc, name, parser) {
    return Array
        .from(doc.getElementsByTagName(name))
        .map(parser)
        .filter(f => is_1.default.value(f));
}
const featuresFromKML = (kml) => {
    const geo = features();
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
    const tracks = [];
    const routes = parseNodes(doc, 'Placemark', routeFromKML);
    const points = parseNodes(doc, 'Placemark', pointFromKML);
    geo.features = geo.features.concat(tracks, routes, points);
    return geo;
};
exports.default = {
    type,
    features,
    geometry,
    pointFromPhoto,
    featuresFromGPX,
    featuresFromKML
};
//# sourceMappingURL=geojson.js.map