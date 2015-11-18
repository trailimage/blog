'use strict';

const config = require('../config.js');
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
		// total points in track
		let count = 0;
		// sum of speed at all points
		let total = 0;

		for (let i = 0; i < segments.length; i++) {
			// NodeList is not ES6 iterable
			track.push(Line.parse(segments[i], 'trkpt'));
		}

		if (track.length == 0 || track[0].length == 0) { return null; }

		let firstPoint = track[0][0];
		let lastLine = track[track.length - 1];
		let lastPoint = lastLine[lastLine.length - 1];

		// milliseconds between first and last point converted to hours
		//stat.duration = format.hoursAndMinutes((last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour);
		stat.duration = (lastPoint[Location.time] - firstPoint[Location.time]) / Enum.time.hour;

		// combined max and average speeds for track segments
		for (let line of track) {
			for (let point of line) {
				let speed = point[Location.speed];

				if (speed < config.map.maxPossibleSpeed) {
					// ignore manually added track points that would imply infinite segment speeds
					if (speed > stat.topSpeed) { stat.topSpeed = parseFloat(speed.toFixed(1)); }
					count++;
					total += speed;
				}
				point = point.slice(0,3);  // remove time and speed from point
			}
			stat.distance += Line.length(line);
			line = simplify(line);
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
	 * Sort photos by time and exclude those more than X standard deviation older
	 * @param {Post} post
	 * @param {function(Track)} callback
	 * @see https://en.wikipedia.org/wiki/Standard_deviation#Basic_examples
	 */
	static fromPost(post, callback) {
		let t = new Track();

		if (!post.photosLoaded)
		{

		}

		for (let p of post.photos) {

		}

		callback(t);
	};
}

module.exports = Track;

// - Private static methods ---------------------------------------------------

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 * @param {Number[][]} points Array of points which are themselves arrays
 * @returns {Number[][]}
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
	let maxDistance = 0;
	let distance = 0;
	let index = 0;

	keep[first] = keep[last] = 1;   // keep the end-points

	while (last) {
		maxDistance = 0;

		for (let i = first + 1; i < last; i++) {
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

	for (let i = 0; i < len; i++) { if (keep[i]) { newPoints.push(points[i]); }	}

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
	// x index in the point object
	const xi = Location.longitude;
	// y index in the point object
	const yi = Location.latitude;
	let x = p1[xi];
	let y = p1[yi];
	let dx = p2[xi] - x;
	let dy = p2[yi] - y;

	if (dx !== 0 || dy !== 0) {
		// non-zero distance
		let t = ((p[xi] - x) * dx + (p[yi] - y) * dy) / (dx * dx + dy * dy);

		if (t > 1) {
			x = p2[xi];
			y = p2[yi];
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[xi] - x;
	dy = p[yi] - y;

	return dx * dx + dy * dy;
}