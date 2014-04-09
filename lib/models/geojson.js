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
 * @param {string} gpx
 * @param {function} callback
 */
exports.fromGPX = function(gpx, callback)
{
	var tj = require('togeojson');
	var DOM = require('xmldom').DOMParser;
	var xml = new DOM().parseFromString(gpx);
	var converted = tj.gpx(xml);
};

/**
 * @param {function(GeoJSON)} callback
 */
function parseGPS(callback)
{
	var geo = new GeoJSON();

	callback(geo);
}

// Simplify -------------------------------------------------------------------

/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
 */

exports.simplify = function(points, tolerance, highestQuality)
{
	var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

	points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
	points = simplifyDouglasPeucker(points, sqTolerance);

	return points;
};

/**
 * Square distance between points
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function pointDistance(p1, p2) {

	var dx = p1[0] - p2[0],
		dy = p1[1] - p2[1];

	return dx * dx + dy * dy;
}

/**
 * Square distance from a point to a segment
 * @param {number[]} p
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function pointLineDistance(p, p1, p2) {

	var x = p1[0],
		y = p1[1],
		dx = p2[0] - x,
		dy = p2[1] - y;

	if (dx !== 0 || dy !== 0)
	{
		var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

		if (t > 1)
		{
			x = p2[0];
			y = p2[1];

		}
		else if (t > 0)
		{
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[0] - x;
	dy = p[1] - y;

	return dx * dx + dy * dy;
}


/**
 * basic distance-based simplification
 * @param {array<number[]>} points
 * @param {number} sqTolerance
 * @returns {array<number[]>}
 */
function simplifyRadialDist(points, sqTolerance) {

	/** @type {number[]} */
	var prevPoint = points[0];
	/** @type {array<number[]>} */
	var newPoints = [prevPoint];
	/** @type {number[]} */
	var point;

	for (var i = 1, len = points.length; i < len; i++)
	{
		point = points[i];

		if (pointDistance(point, prevPoint) > sqTolerance)
		{
			newPoints.push(point);
			prevPoint = point;
		}
	}

	if (prevPoint !== point) { newPoints.push(point); }

	return newPoints;
}

// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(points, sqTolerance)
{
	var len = points.length,
		MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
		markers = new MarkerArray(len),
		first = 0,
		last = len - 1,
		stack = [],
		newPoints = [],
		i, maxSqDist, sqDist, index;

	markers[first] = markers[last] = 1;

	while (last)
	{
		maxSqDist = 0;

		for (i = first + 1; i < last; i++)
		{
			sqDist = pointLineDistance(points[i], points[first], points[last]);

			if (sqDist > maxSqDist)
			{
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance)
		{
			markers[index] = 1;
			stack.push(first, index, index, last);
		}

		last = stack.pop();
		first = stack.pop();
	}

	for (i = 0; i < len; i++)
	{
		if (markers[i])
		{
			newPoints.push(points[i]);
		}
	}

	return newPoints;
}