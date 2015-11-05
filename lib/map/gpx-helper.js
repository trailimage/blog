'use strict';

const Geometry = require('./geometry.js');
const Enum = require('../enum.js');

/**
 * GPX helper methods
 */
class GPX {
	/**
	 * Properties of a GPX node
	 * @param {Node} node
	 * @param {Object} [extras] Object literal of additional properties to set
	 * @returns {Object}
	 */
	static properties(node, extras) {
		var names = ['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords'];
		var properties = (extras) ? extras : {};

		for (let i = 0; i < names.length; i++) {
			let value = GPX.value(GPX.firstNode(node, names[i]));
			if (value) { properties[names[i]] = value; }
		}
		return properties;
	}
	/**
	 * Return location as [longitude, latitude, elevation, time, speed]
	 * A degree of latitude is approximately 69 miles
	 * A degree of longitude is about 69 miles at the equater, 0 at the poles
	 * @param {Node|Element} node
	 * @returns {Number[]}
	 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
	 */
	static location(node) {
		var location = [GPX._attrf(node, 'lon'), GPX._attrf(node, 'lat')];    // decimal degrees
		var elevation = GPX.firstNode(node, 'ele');                     // meters
		var t = GPX.firstNode(node, 'time');                            // UTC

		// exclude points close to home
		if (GPX.distance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

		if (elevation) {
			let m = parseFloat(GPX.value(elevation));
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
	 * Distance in miles between geographic points
	 * South latitudes are negative, east longitudes are positive
	 * @param {number[]} p1 [longitude, latitude, elevation, time]
	 * @param {number[]} p2
	 * @return {number}
	 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
	 * @see http://www.geodatasource.com/developers/javascript
	 */
	static distance(p1, p2) {
		if (sameLocation(p1, p2)) { return 0; }

		var theta = p1[Geometry.Index.longitude] - p2[Geometry.Index.longitude];
		var d = Math.sin(deg2rad(p1[Geometry.Index.latitude])) * Math.sin(deg2rad(p2[Geometry.Index.latitude]))
			+ Math.cos(deg2rad(p1[Geometry.Index.latitude])) * Math.cos(deg2rad(p2[Geometry.Index.latitude])) * Math.cos(deg2rad(theta));

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
	 * @param {Node|Element} node
	 * @param {String} name
	 * @returns {Array} Array of point arrays
	 */
	static line(node, name) {
		let points = node.getElementsByTagName(name);
		let line = [];
		let t, d, p;

		for (let i = 0; i < points.length; i++) {
			p = GPX.location(points[i]);
			if (p != null) { line.push(p); }
		}

		// add speed to each point
		for (let i = 1; i < line.length; i++) {
			t = line[i][Geometry.Index.time] - line[i - 1][Geometry.Index.time];                  // milliseconds
			d = GPX.distance(line[i], line[i - 1]);                                 // miles
			line[i][Geometry.Index.speed] = (t > 0 && d > 0) ? d/(t/Enum.time.hour) : 0; // miles per hour
		}
		return line;
	}

	/**
	 * Total distance between points in a line
	 * @param {Array} points
	 */
	static lineLength(points) {
		let length = 0;
		let lastPoint = null;

		for (let p of points) {
			if (lastPoint) { length += GPX.distance(lastPoint, p); }
			lastPoint = p;
		}
		return length;
	}

	/**
	 * Node content
	 * @param {Node} node
	 * @returns {string}
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
	 */
	static value(node) {
		if (node && node.normalize) { node.normalize(); }
		return node && node.firstChild && node.firstChild.nodeValue;
	}

	/**
	 * First child or null
	 * @param {Document|Node} node
	 * @param {String} tag
	 * @returns {Node}
	 */
	static firstNode(node, tag) {
		var n = node.getElementsByTagName(tag);
		return n.length ? n[0] : null;
	}

	/**
	 * @param {Node|Element} dom
	 * @param {String} name
	 * @returns {Number}
	 * @private
	 */
	static _attrf(dom, name) { return parseFloat(dom.getAttribute(name)); }
}

module.exports = GPX;