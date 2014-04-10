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
	/** @type {GeoJSON} */
	var geo = parseGPX(gpx);
	/** @type {GeoJSON.Feature} */
	var feature;

	for (var i = 0; i < geo.features.length; i++)
	{
		feature = geo.features[i];
		feature.geometry.coordinates = simplifyTrack(feature.geometry.coordinates);
	}

	callback(true);
};

// GPX to GeoJSON -------------------------------------------------------------
// https://github.com/mapbox/togeojson

/**
 * @param {String} gpx
 * @return {GeoJSON}
 */
function parseGPX(gpx)
{
	var DOM = require('xmldom').DOMParser;
	var xml = new DOM().parseFromString(gpx);
	var i;
	var tracks = xml.getElementsByTagName('trk');
	var routes = xml.getElementsByTagName('rte');
	var waypoints = xml.getElementsByTagName('wpt');
	/** @type {GeoJSON} */
	var geo = {
		type: 'FeatureCollection',
		features: []
	};

	for (i = 0; i < tracks.length; i++)
	{
		geo.features.push(getTrack(tracks[i]));
	}
	for (i = 0; i < routes.length; i++)
	{
		geo.features.push(getRoute(routes[i]));
	}
	for (i = 0; i < waypoints.length; i++)
	{
		geo.features.push(getPoint(waypoints[i]));
	}
	return geo;
}

/**
 * First child or null
 * @param {Document|Node} node
 * @param {String} tag
 * @returns {Node}
 */
function firstNode(node, tag)
{
	var n = node.getElementsByTagName(tag);
	return n.length ? n[0] : null;
}

/**
 * @param {Node|Element} dom
 * @param {String} name
 * @returns {Number}
 */
function attrf(dom, name) { return parseFloat(dom.getAttribute(name)); }

/**
 * Node content
 * @param {Node} node
 * @returns {string}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function nodeValue(node)
{
	if (node && node.normalize) { node.normalize(); }
	return node && node.firstChild && node.firstChild.nodeValue;
}

/**
 * @param {Node|Element} node
 * @returns {Number[]}
 */
function getLocation(node)
{
	var location = [attrf(node, 'lon'), attrf(node, 'lat')];
	var elevation = firstNode(node, 'ele');
	var t = firstNode(node, 'time');

	if (elevation) { location.push(parseFloat(nodeValue(elevation))); }
	if (t)
	{
		var d = new Date(nodeValue(t));
		location.push(d.getTime());
	}
	return location;
}

/**
 * @param {Node|Element} node
 * @returns {GeoJSON.Feature}
 */
function getTrack(node)
{
	var segments = node.getElementsByTagName('trkseg');
	var track = [];

	for (var i = 0; i < segments.length; i++)
	{
		track.push(getLine(segments[i], 'trkpt'));
	}
	return {
		type: 'Feature',
		properties: getProperties(node),
		geometry: {
			type: track.length === 1 ? 'LineString' : 'MultiLineString',
			coordinates: track.length === 1 ? track[0] : track
		}
	};
}

/**
 *
 * @param {Node} node
 * @returns {GeoJSON.Feature}
 */
function getPoint(node)
{
	var p = getProperties(node);

	p.sym = nodeValue(firstNode(node, 'sym'));

	return {
		type: 'Feature',
		properties: p,
		geometry: {
			type: 'Point',
			coordinates: getLocation(node)
		}
	};
}

/**
 * @param {Node|Element} node
 * @param {String} name
 * @returns {Array}
 */
function getLine(node, name)
{
	var points = node.getElementsByTagName(name);
	var line = [];

	for (var i = 0; i < points.length; i++)
	{
		line.push(getLocation(points[i]));
	}
	return line;
}

/**
 * @param {Node} node
 * @returns {GeoJSON.Feature}
 */
function getRoute(node)
{
	return {
		type: 'Feature',
		properties: getProperties(node),
		geometry: {
			type: 'LineString',
			coordinates: getLine(node, 'rtept')
		}
	};
}

/**
 * @param {Node} node
 * @returns {Object}
 */
function getProperties(node)
{
	var names = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'];
	var properties = {};

	for (var i = 0; i < names.length; i++)
	{
		var value = nodeValue(firstNode(node, names[i]));
		if (value) { properties[names[i]] = value; }
	}
	return properties;
}

// Simplify -------------------------------------------------------------------

/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
 */

function simplifyTrack(points, tolerance, highestQuality)
{
	var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

	points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
	points = simplifyDouglasPeucker(points, sqTolerance);

	return points;
}

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