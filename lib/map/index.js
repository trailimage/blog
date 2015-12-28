'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @alias TI.Map
 */
class MapNamespace {
	/**
	 * @returns {GeoCoordinates}
	 * @alias TI.Map.Coordinates
	 * @constructor
	 */
	static get Coordinates() { return require('./geo-coordinates.js'); }

	/**
	 * @alias TI.Map.Feature
	 * @constructor
	 */
	static get Feature() { return require('./geo-feature.js'); }

	/**
	 * @alias TI.Map.FeatureList
	 * @constructor
	 */
	static get FeatureList() { return require('./geo-feature-list.js'); }

	/**
	 * @alias TI.Map.Point
	 * @constructor
	 */
	static get Point() { return require('./geo-point.js'); }

	/**
	 * @alias TI.Map.Route
	 * @constructor
	 */
	static get Route() { return require('./geo-route.js'); }

	/**
	 * @alias TI.Map.Track
	 * @constructor
	 */
	static get Track() { return require('./geo-track.js'); }

	/**
	 * @alias TI.Map.Geometry
	 * @constructor
	 */
	static get Geometry() { return require('./geometry.js'); }

	/**
	 * @alias TI.Map.Helper
	 * @constructor
	 */
	static get Helper() { return require('./gpx-helper.js'); }

	/**
	 * @alias TI.Map.Line
	 * @constructor
	 */
	static get Line() { return require('./gpx-line.js'); }

	/**
	 * @alias TI.Map.Location
	 * @constructor
	 */
	static get Location() { return require('./gpx-location.js'); }
}

/**
 * @returns {GeoJSON}
 * @alias TI.Map.Base
 * @constructor
 */
MapNamespace.Base = require('./geo-base.js');

/**
 * @alias TI.Map.Type
 */
MapNamespace.Type = {
	feature: 'Feature',
	featureCollection: 'FeatureCollection',
	point: 'Point',
	line: 'LineString',
	multiLine: 'MultiLineString'
};

module.exports = MapNamespace;