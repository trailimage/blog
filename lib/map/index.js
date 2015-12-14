'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.Map
 */
class MapNamespace {
	/**
	 * @returns GeoCoordinates
	 * @namespace TI.Map.Coordinates
	 * @constructor
	 */
	static get Coordinates() { return require('./geo-coordinates.js'); }

	/**
	 * @namespace TI.Map.Feature
	 * @constructor
	 */
	static get Feature() { return require('./geo-feature.js'); }

	/**
	 * @namespace TI.Map.FeatureList
	 * @constructor
	 */
	static get FeatureList() { return require('./geo-feature-list.js'); }

	/**
	 * @namespace TI.Map.Point
	 * @constructor
	 */
	static get Point() { return require('./geo-point.js'); }

	/**
	 * @namespace TI.Map.Route
	 * @constructor
	 */
	static get Route() { return require('./geo-route.js'); }

	/**
	 * @namespace TI.Map.Track
	 * @constructor
	 */
	static get Track() { return require('./geo-track.js'); }

	/**
	 * @namespace TI.Map.Geometry
	 * @constructor
	 */
	static get Geometry() { return require('./geometry.js'); }

	/**
	 * @namespace TI.Map.Helper
	 * @constructor
	 */
	static get Helper() { return require('./gpx-helper.js'); }

	/**
	 * @namespace TI.Map.Line
	 * @constructor
	 */
	static get Line() { return require('./gpx-line.js'); }

	/**
	 * @namespace TI.Map.Location
	 * @constructor
	 */
	static get Location() { return require('./gpx-location.js'); }
}

/**
 * @returns GeoJSON
 * @namespace TI.Map.Base
 * @constructor
 */
MapNamespace.Base = require('./geo-base.js');

/**
 * @namespace TI.Map.Type
 */
MapNamespace.Type = {
	feature: 'Feature',
	featureCollection: 'FeatureCollection',
	point: 'Point',
	line: 'LineString',
	multiLine: 'MultiLineString'
};

module.exports = MapNamespace;