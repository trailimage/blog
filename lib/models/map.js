'use strict';

const config = require('../config.js');
const format = require('../format.js');
const is = require('../is.js');
const Enum = require('../enum.js');
const log = config.provider.log;

class TrailMap {
	constructor() {
		this.point = point;
		/**
		 * @type {GeoJSON}
		 */
		this.json = null;
	}

	/**
	 * Create map from photo coordinates for posts without GPX tracks
	 * @param {Post} post
	 * @param {function(GeoJSON)} callback
	 */
	fromPost(post, callback) {
		if (!post.photosLoaded)
		{

		}
		callback(geo);
	};

	/**
	 *
	 * @param {string} slug
	 * @param {function(Boolean|Object)} callback
	 */
	loadGPX(slug, callback) {
		config.provider.cache.getObject(key, slug, callback);
	};

	/**
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 */
	makeGPX(post, callback) {
		this._getPhotos({ type: 'FeatureCollection', features: [] }, post, callback);
	}

	/**
	 * @param {String} gpx
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 */
	saveGPX(gpx, post, callback) {
		/** @type {GeoJSON} */
		let geo = parseGPX(gpx);

		if (geo === null) { callback(false); return; }
		// move to the first post in a series
		if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }

		this._getPhotos(geo, post, callback);
	};

	/**
	 * Add photos from every post in a series then save
	 * @param {GeoJSON|Object} geo
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 * @private
	 */
	_getPhotos(geo, post, callback) {
		config.provider.data.loadPostPhotos(post, () => {
			// specific slug is needed to link photo back to particular part in series
			let slug = post.isPartial ? post.slug : null;

			geo.features = geo.features.concat(
				post.photos
					.filter(p => p.latitude > 0)
					.map(p => parsePhoto(p, slug))
			);

			if (post.nextIsPart) {
				this._getPhotos(geo, post.next, callback);
			} else {
				this._save(geo, post, callback);
			}
		});
	}

	/**
	 * Add photos from every post in a series
	 * @param {GeoJSON|Object} geo
	 * @param {Post} post
	 * @param {function(Boolean)} callback
	 * @private
	 */
	_save(geo, post, callback) {
		let compress = require('zlib');
		let slug = (post.isPartial) ? post.seriesSlug : post.slug;

		compress.gzip(JSON.stringify(geo), (err, buffer) => {
			config.provider.cache.add(key, slug, {
				'buffer': buffer.toString('hex'),
				'eTag': slug + '_map_' + (new Date()).getTime().toString()
			}, callback);
		});
	}
}

module.exports = TrailMap;

// - Private static members ---------------------------------------------------

/**
 * @enum {number}
 * @const
 */
const point = {
	longitude: 0,
	latitude: 1,
	elevation: 2,
	time: 3,
	speed: 4
};

/**
 * Cache key that contains field keys for each cached GPX
 * @type {string}
 */
const key = 'map';

// Distance -------------------------------------------------------------------

/**
 * Total distance between points in a line
 * @param {Array} points
 */
function lineLength(points) {
	let length = 0;
	let lastPoint = null;

	for (let p of points) {
		if (lastPoint) { length += distance(lastPoint, p); }
		lastPoint = p;
	}
	return length;
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
function distance(p1, p2) {
	if (sameLocation(p1, p2)) { return 0; }

	var theta = p1[point.longitude] - p2[point.longitude];
	var d = Math.sin(deg2rad(p1[point.latitude])) * Math.sin(deg2rad(p2[point.latitude]))
		  + Math.cos(deg2rad(p1[point.latitude])) * Math.cos(deg2rad(p2[point.latitude])) * Math.cos(deg2rad(theta));

	if (d >= -1 && d <= 1) {
		d = Math.acos(d);
		d = rad2deg(d);
		d = d * 60 * 1.1515;    // miles
	} else {
		d = 0;
	}
	return d;
}

/**
 * Whether two points are at the same location (disregarding elevation)
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {Boolean}
 */
function sameLocation(p1, p2) {
	return p1[point.latitude] == p2[point.latitude]
		&& p1[point.longitude] == p2[point.longitude];
}
function deg2rad(deg) { return (deg * Math.PI / 180.0); }
function rad2deg(rad) {	return (rad * 180.0 / Math.PI); }

// GPX to GeoJSON -------------------------------------------------------------
// https://github.com/mapbox/togeojson

/**
 * Convert GPX to GeoJSON
 * @param {String} gpx
 * @return {GeoJSON|Object}
 */
function parseGPX(gpx) {
	let DOM = require('xmldom').DOMParser;
	/** @type {Document} */
	let xml = null;

	try {
		xml = new DOM().parseFromString(gpx);
	} catch (ex) {
		log.error(ex.toString());
		return null;
	}

	return {
		type: 'FeatureCollection',
		features:
			parseFeature(xml, 'trk', parseTrack).concat(
			parseFeature(xml, 'rte', parseRoute).concat(
			parseFeature(xml, 'wpt', parsePoint)))
	};
}

/**
 *
 * @param {Document} xml
 * @param {String} name
 * @param {Function(Element)} parser
 * @return {Array}
 */
function parseFeature(xml, name, parser) {
	/**
	 * Node list is not ES6 iterable
	 * @type {NodeList}
	 */
	let nodes = xml.getElementsByTagName(name);
	let features = [];

	for (let i = 0; i < nodes.length; i++) {
		let f = parser(nodes[i]);
		if (f !== null) { features.push(f); }
	}
	return features;
}

/**
 * First child or null
 * @param {Document|Node} node
 * @param {String} tag
 * @returns {Node}
 */
function firstNode(node, tag) {
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
function nodeValue(node) {
	if (node && node.normalize) { node.normalize(); }
	return node && node.firstChild && node.firstChild.nodeValue;
}

/**
 * Return location as [longitude, latitude, elevation, time, speed]
 * A degree of latitude is approximately 69 miles
 * A degree of longitude is about 69 miles at the equater, 0 at the poles
 * @param {Node|Element} node
 * @returns {Number[]}
 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
 */
function parseLocation(node) {
	var location = [attrf(node, 'lon'), attrf(node, 'lat')];    // decimal degrees
	var elevation = firstNode(node, 'ele');                     // meters
	var t = firstNode(node, 'time');                            // UTC

	// exclude points close to home
	if (distance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

	if (elevation) {
		let m = parseFloat(nodeValue(elevation));
		location.push(Math.round(m * 3.28084));     // convert meters to whole feet
	}
	if (t) {
		let d = new Date(nodeValue(t));
		location.push(d.getTime());
	}
	// empty speed
	location.push(0);

	return location;
}

/**
 * @param {Node|Element} node
 * @returns {GeoJSON.Feature}
 */
function parseTrack(node) {
	let segments = node.getElementsByTagName('trkseg');
	let track = [];
	let stat = { topSpeed: 0, avgSpeed: 0, duration: 0, distance: 0 };
	let count = 0;
	let total = 0;
	let s = 0;
	let last;

	for (let i = 0; i < segments.length; i++) {
		track.push(parseLine(segments[i], 'trkpt'));
	}

	if (track.length == 0 || track[0].length == 0) { return null; }

	last = track[track.length - 1];

	// milliseconds between first and last point converted to hours
	//stat.duration = format.hoursAndMinutes((last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour);
	stat.duration = (last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour;

	// get combined max and average speeds for track segments
	for (let i = 0; i < track.length; i++) {
		for (let j = 1; j < track[i].length; j++) {
			count++;
			s = track[i][j][point.speed];
			if (s > stat.topSpeed) { stat.topSpeed = parseFloat(s.toFixed(1)); }
			track[i][j] = (track[i][j]).slice(0,3);   // remove time and speed
			total += s;
		}
		stat.distance += lineLength(track[i]);
		track[i] = simplifyTrack(track[i]);
	}

	stat.avgSpeed = parseFloat((total / count).toFixed(1));
	stat.distance = parseFloat(stat.distance.toFixed(2));

	return {
		type: 'Feature',
		properties: getProperties(node, stat),
		geometry: {
			type: track.length === 1 ? 'LineString' : 'MultiLineString',
			coordinates: track.length === 1 ? track[0] : track
		}
	};
}

/**
 * @param {Node} node
 * @returns {GeoJSON.Feature}
 */
function parsePoint(node) {
	var p = getProperties(node);

	p.sym = nodeValue(firstNode(node, 'sym'));

	return {
		type: 'Feature',
		properties: p,
		geometry: {
			type: 'Point',
			coordinates: parseLocation(node)
		}
	};
}

/**
 * Convert Flickr photo to GeoJSON feature
 * @param {Photo} photo
 * @param {String} [partSlug] Slug to one part in a series
 * @returns {GeoJSON.Feature|Object}
 */
function parsePhoto(photo, partSlug) {
	return {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [parseFloat(photo.longitude), parseFloat(photo.latitude)]
		},
		properties: {
			id: photo.id,
			title: photo.title,
			partSlug: partSlug,
			preview: photo.size.preview.url
		}
	};
}

/**
 * @param {Node|Element} node
 * @param {String} name
 * @returns {Array} Array of point arrays
 */
function parseLine(node, name) {
	var points = node.getElementsByTagName(name);
	var line = [];
	var t, d, p;

	for (let i = 0; i < points.length; i++) {
		p = parseLocation(points[i]);
		if (p != null) { line.push(p); }
	}

	// add speed to each point
	for (let i = 1; i < line.length; i++) {
		t = line[i][point.time] - line[i - 1][point.time];                  // milliseconds
		d = distance(line[i], line[i - 1]);                                 // miles
		line[i][point.speed] = (t > 0 && d > 0) ? d/(t/Enum.time.hour) : 0; // miles per hour
	}
	return line;
}

/**
 * Create route object
 * @param {Node} node
 * @returns {GeoJSON.Feature}
 */
function parseRoute(node) {
	return {
		type: 'Feature',
		properties: getProperties(node),
		geometry: {
			type: 'LineString',
			coordinates: parseLine(node, 'rtept')
		}
	};
}

/**
 * Properties of a GPX node
 * @param {Node} node
 * @param {Object} [extras] Object literal of additional properties to set
 * @returns {Object}
 */
function getProperties(node, extras) {
	var names = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'];
	var properties = (extras) ? extras : {};

	for (let i = 0; i < names.length; i++) {
		let value = nodeValue(firstNode(node, names[i]));
		if (value) { properties[names[i]] = value; }
	}
	return properties;
}

// Simplify -------------------------------------------------------------------

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 * @param {Array} points
 * @returns {Array}
 */
function simplifyTrack(points) {
	var len = points.length,
		keep = new Uint8Array(len),
		// convert tolerance in feet to tolerance in geographic degrees
		tolerance = config.map.maxDeviationFeet / Enum.distance.equator,
		first = 0,
		last = len - 1,
		stack = [],
		newPoints = [],
		i, maxDistance, distance, index;

	keep[first] = keep[last] = 1;   // keep the end-points

	while (last) {
		maxDistance = 0;

		for (i = first + 1; i < last; i++) {
			distance = pointLineDistance(points[i], points[first], points[last]);

			if (distance > maxDistance) {
				index = i;
				maxDistance = distance;
			}
		}

		if (maxDistance > tolerance) {
			keep[index] = 1;    // keep the deviant point
			stack.push(first, index, index, last);
		}

		last = stack.pop();
		first = stack.pop();
	}

	for (i = 0; i < len; i++) {	if (keep[i]) { newPoints.push(points[i]); }	}

	return newPoints;
}

/**
 * Shortest distance from a point to a segment
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

	if (dx !== 0 || dy !== 0) {
		var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

		if (t > 1) {
			x = p2[0];
			y = p2[1];
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[0] - x;
	dy = p[1] - y;

	return dx * dx + dy * dy;
}