var setting = require('../settings.js');
var Enum = require('../enum.js');
var key = 'map';

/**
 * @type {GeoJSON}
 */
exports.json = null;

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
 * @param {String} slug
 * @param {function} callback
 */
exports.saveGPX = function(gpx, slug, callback)
{
	/** @type {GeoJSON} */
	var geo = parseGPX(gpx);
	var keep = [];  // feature indices to keep
	var compress = require('zlib');
	var db = require('../adapters/hash.js');

	for (var i = 0; i < geo.features.length; i++)
	{
		var feature = geo.features[i];

		if (feature.geometry.coordinates.length > setting.map.minimumTrackPoints)
		{
			var miles = lineLength(feature.geometry.coordinates);

			if (miles >= setting.map.minimumTrackLength)
			{
				feature.properties.distance = miles;
				keep.push(feature);
			}
		}
	}

	geo.features = keep;

	for (var k = 0; k < geo.features.length; k++)
	{
		geo.features[k].geometry.coordinates = simplifyTrack(geo.features[k].geometry.coordinates);
	}

	compress.gzip(JSON.stringify(geo), function(err, buffer)
	{
		db.add(key, slug,
		{
			'buffer': buffer.toString('hex'),
			'eTag': slug + '_map_' + (new Date()).getTime().toString()
		}, callback);
	});
};

// Distance -------------------------------------------------------------------

/**
 * @param {Array} points
 */
function lineLength(points)
{
	var distance = 0;
	var lastPoint = null;

	for (var i = 0; i < points.length; i++)
	{
		if (lastPoint) { distance += length(lastPoint, points[i]); }
		lastPoint = points[i];
	}

	//distance = length([43.618710, -116.214607], [43.612109 , -116.391513]);
	return distance;
}

/**
 * Distance in miles between geographic points
 * South latitudes are negative, east longitudes are positive
 * @param {number[]} p1 [longitude, latitude, elevation, time]
 * @param {number[]} p2
 * @return {number}
 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
 * @see http://www.geodatasource.com/developers/javascript
 */
function length(p1, p2)
{
	if (sameLocation(p1, p2)) { return 0; }

	var theta = p1[0] - p2[0];
	var d = Math.sin(deg2rad(p1[1])) * Math.sin(deg2rad(p2[1])) + Math.cos(deg2rad(p1[1])) * Math.cos(deg2rad(p2[1])) * Math.cos(deg2rad(theta));

	d = Math.acos(d);
	d = rad2deg(d);
	d = d * 60 * 1.1515;

	return d;
}

/**
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {Boolean}
 */
function sameLocation(p1, p2) { return p1[0] == p2[0] && p1[1] == p2[1]; }
function deg2rad(deg) { return (deg * Math.PI / 180.0); }
function rad2deg(rad) {	return (rad * 180.0 / Math.PI); }

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
 * Return location as [longitude, latitude, elevation, time, [speed]]
 * A degree of latitude is approximately 69 miles
 * A degree of longitude is about 69 miles at the equater, 0 at the poles
 * @param {Node|Element} node
 * @returns {Number[]}
 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
 */
function getLocation(node)
{
	var location = [attrf(node, 'lon'), attrf(node, 'lat')];    // decimal degrees
	var elevation = firstNode(node, 'ele');                     // meters
	var t = firstNode(node, 'time');                            // UTC

	if (elevation)
	{
		var m = parseFloat(nodeValue(elevation));
		location.push(m * 3.28084);     // convert meters to feet
	}
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

/**
 * Simplification using optimized Douglas-Peucker algorithm with recursion elimination
 * @param {Array} points
 * @returns {Array}
 */
function simplifyTrack(points)
{
	var len = points.length,
		MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
		markers = new MarkerArray(len),
		// convert tolerance in feet to tolerance in geographic degrees
		tolerance = setting.map.maxDeviationFeet / (Enum.distance.equator / 360),
		first = 0,
		last = len - 1,
		stack = [],
		newPoints = [],
		i, maxDistance, distance, index;

	markers[first] = markers[last] = 1;

	while (last)
	{
		maxDistance = 0;

		for (i = first + 1; i < last; i++)
		{
			distance = pointLineDistance(points[i], points[first], points[last]);

			if (distance > maxDistance)
			{
				index = i;
				maxDistance = distance;
			}
		}

		if (maxDistance > tolerance)
		{
			markers[index] = 1;
			stack.push(first, index, index, last);
		}

		last = stack.pop();
		first = stack.pop();
	}

	for (i = 0; i < len; i++)
	{
		if (markers[i]) { newPoints.push(points[i]); }
	}

	return newPoints;
}

/**
 * Distance from a point to a segment
 * @param {number[]} p
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function pointLineDistance(p, p1, p2)
{
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