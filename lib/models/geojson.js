var util = require('util');

// Base -----------------------------------------------------------------------

/**
 * @constructor
 */
function GeoJSON() {}

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

// Geometry -------------------------------------------------------------------

function Geometry() { GeoJSON.call(this); }

/**
 * @type {Array}
 * @see http://geojson.org/geojson-spec.html#positions
 */
Geometry.prototype.coordinates;

util.inherits(Geometry, GeoJSON);

// Feature --------------------------------------------------------------------

function Feature() { GeoJSON.call(this); }

/**
 * @type {String}
 */
Feature.prototype.id;

/**
 * @type {Geometry}
 */
Feature.prototype.geometry;

util.inherits(Feature, GeoJSON);

// Coordinate Reference System ------------------------------------------------

function CoordinateReferenceSystem() { GeoJSON.call(this); }

util.inherits(CoordinateReferenceSystem, GeoJSON);

// Static ---------------------------------------------------------------------

/**
 * @enum {String}
 */
exports.types =
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
 * @param {Post} post
 * @param {function(GeoJSON)} callback
 */
exports.fromPost = function(post, callback)
{
	if (!post.photosLoaded)
	{

	}

	callback(geo);
};

/**
 * @param {function(GeoJSON)} callback
 */
function parseGPS(callback)
{
	var geo = new GeoJSON();

	callback(geo);
}
