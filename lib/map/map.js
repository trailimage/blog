'use strict';

const config = require('../config.js');
const format = require('../format.js');
const is = require('../is.js');
const Enum = require('../enum.js');
const Feature = require('./geo-feature.js');
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

// GPX to GeoJSON -------------------------------------------------------------
// https://github.com/mapbox/togeojson

/**
 * Convert GPX to GeoJSON
 * @param {String} gpx
 * @return {GeoJSON}
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
			Feature.parseGPX(xml, 'trk', parseTrack).concat(
			Feature.parseGPX(xml, 'rte', parseRoute).concat(
			Feature.parseGPX(xml, 'wpt', parsePoint)))
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