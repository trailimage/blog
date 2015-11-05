'use strict';

const GeoBase = require('./geo-base');
const Geometry = require('./geometry.js');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper.js');
const Enum = require('../enum.js');

/**
 * Tracks consist of line segments
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class Track extends GeoFeature {
	constructor() {
		super();

		this.type = GeoBase.type.track;
	}

	/**
	 * @param {Node|Element} node
	 * @returns {GeoFeature}
	 */
	static parse(node) {
		let t = new Track();
		let segments = node.getElementsByTagName('trkseg');
		let track = [];
		let stat = { topSpeed: 0, avgSpeed: 0, duration: 0, distance: 0 };
		let count = 0;
		let total = 0;
		let s = 0;
		let last;

		for (let i = 0; i < segments.length; i++) {
			track.push(GPX.line(segments[i], 'trkpt'));
		}

		if (track.length == 0 || track[0].length == 0) { return null; }

		last = track[track.length - 1];

		// milliseconds between first and last point converted to hours
		//stat.duration = format.hoursAndMinutes((last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour);
		stat.duration = (last[last.length - 1][Geometry.Index.time] - track[0][0][Geometry.Index.time]) / Enum.time.hour;

		// get combined max and average speeds for track segments
		for (let i = 0; i < track.length; i++) {
			for (let j = 1; j < track[i].length; j++) {
				count++;
				s = track[i][j][Geometry.Index.speed];
				if (s > stat.topSpeed) { stat.topSpeed = parseFloat(s.toFixed(1)); }
				track[i][j] = (track[i][j]).slice(0,3);   // remove time and speed
				total += s;
			}
			stat.distance += GPX.lineLength(track[i]);
			track[i] = simplify(track[i]);
		}

		stat.avgSpeed = parseFloat((total / count).toFixed(1));
		stat.distance = parseFloat(stat.distance.toFixed(2));

		return {
			type: 'Feature',
			properties: GPX.properties(node, stat),
			geometry: {
				type: track.length === 1 ? 'LineString' : 'MultiLineString',
				coordinates: track.length === 1 ? track[0] : track
			}
		};
	}

	/**
	 * Create map from photo coordinates for posts without GPX tracks
	 * @param {Post} post
	 * @param {function(Track)} callback
	 */
	static fromPost(post, callback) {
		let t = new Track();

		if (!post.photosLoaded)
		{

		}
		callback(t);
	};
}

module.exports = Track;

// - Private static methods ---------------------------------------------------

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 * @param {Array} points
 * @returns {Array}
 */
function simplify(points) {
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