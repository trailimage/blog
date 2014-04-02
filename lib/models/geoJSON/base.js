/**
 * @constructor
 */
function GeoJSON() {}

/**
 * @enum {String}
 */
GeoJSON.types =
{
	point: 'Point',
	multiPoint: 'MultiPoint',
	lineString: 'LineString',
	multiLineString: 'MultiLineString',
	polygon: 'Polygon',
	multiPolygon: 'MultiPolygon',
	geometryCollection: 'GeometryCollection',
	feature: 'Feature',
	featureCollection: 'FeatureCollection'
};

/**
 * @type {String}
 */
GeoJSON.prototype.type;

/**
 * @type {Object}
 */
GeoJSON.prototype.properties;

/**
 * @type {Array}
 * @see http://geojson.org/geojson-spec.html#bounding-boxes
 */
GeoJSON.prototype.bbox;

exports = GeoJSON;
