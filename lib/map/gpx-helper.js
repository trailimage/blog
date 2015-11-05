'use strict';

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
			let value = nodeValue(GPX.firstNode(node, names[i]));
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