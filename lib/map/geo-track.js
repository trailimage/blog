'use strict';

const GeoJSON = require('./geo-base');
const Geometry = require('./geometry.js');
const GeoFeature = require('./geo-feature');
const Location = require('./gpx-location.js');
const Line = require('./gpx-line.js');
const GPX = require('./gpx-helper.js');
const Enum = require('../enum.js');

/**
 * Tracks consist of line segments
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class Track extends GeoFeature {
	/**
	 * @param {Node|Element} node
	 * @returns {Track}
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
			track.push(Line.parse(segments[i], 'trkpt'));
		}

		if (track.length == 0 || track[0].length == 0) { return null; }

		last = track[track.length - 1];

		// milliseconds between first and last point converted to hours
		//stat.duration = format.hoursAndMinutes((last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour);
		stat.duration = (last[last.length - 1][Location.time] - track[0][0][Location.time]) / Enum.time.hour;

		// get combined max and average speeds for track segments
		for (let i = 0; i < track.length; i++) {
			for (let j = 1; j < track[i].length; j++) {
				count++;
				s = track[i][j][Location.speed];
				if (s > stat.topSpeed) { stat.topSpeed = parseFloat(s.toFixed(1)); }
				track[i][j] = (track[i][j]).slice(0,3);   // remove time and speed
				total += s;
			}
			stat.distance += Line.length(track[i]);
			track[i] = simplify(track[i]);
		}

		stat.avgSpeed = parseFloat((total / count).toFixed(1));
		stat.distance = parseFloat(stat.distance.toFixed(2));

		let geoType = GeoJSON.Type.multiLine;
		let coords = track;

		if (track.length === 1) {
			geoType = GeoJSON.Type.line;
			coords = track[0];
		}

		t.properties = GPX.properties(node, stat);
		t.geometry = new Geometry(geoType, coords);

		return t;
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
 * @param {Number[][]} points
 * @returns {Array}
 */
function simplify(points) {
	let len = points.length;
	let keep = new Uint8Array(len);
	// convert tolerance in feet to tolerance in geographic degrees
	let tolerance = config.map.maxDeviationFeet / Enum.distance.equator;
	let first = 0;
	let last = len - 1;
	let stack = [];
	let newPoints = [];
	let i = 0;
	let maxDistance = 0;
	let distance = 0;
	let index = 0;

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

	for (i = 0; i < len; i++) { if (keep[i]) { newPoints.push(points[i]); }	}

	return newPoints;
}

/**
 * Shortest distance from a point to a segment
 * @param {number[]} p
 * @param {number[]} p1 Segment start
 * @param {number[]} p2 Segment end
 * @returns {number}
 */
function pointLineDistance(p, p1, p2) {
	let x = p1[Location.longitude];
	let y = p1[Location.latitude];
	let dx = p2[Location.longitude] - x;
	let dy = p2[Location.latitude] - y;

	if (dx !== 0 || dy !== 0) {
		let t = ((p[Location.longitude] - x) * dx + (p[Location.latitude] - y) * dy) / (dx * dx + dy * dy);

		if (t > 1) {
			x = p2[Location.longitude];
			y = p2[Location.latitude];
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[Location.longitude] - x;
	dy = p[Location.latitude] - y;

	return dx * dx + dy * dy;
}