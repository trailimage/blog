'use strict';

const GeoBase = require('./geo-base');
const GeoFeature = require('./geo-feature');
const GPX = require('./gpx-helper.js');

/**
 * @extends {GeoFeature}
 * @see http://geojson.org/geojson-spec.html
 */
class GeoTrack extends GeoFeature {
	constructor() {
		super();

		this.type = GeoBase.type.track;
	}

	/**
	 * @param {Node|Element} node
	 * @returns {GeoFeature}
	 */
	static parse(node) {
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
			properties: GPX.properties(node, stat),
			geometry: {
				type: track.length === 1 ? 'LineString' : 'MultiLineString',
				coordinates: track.length === 1 ? track[0] : track
			}
		};
	}
}

module.exports = GeoTrack;