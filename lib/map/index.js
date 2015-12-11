'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.Map
 */
class MapNamespace {
	/**
	 * @returns {GeoCoordinates}
	 * @namespace TI.Map.Coordinates
	 * @constructor
	 */
	static get Coordinates() { return require('./geo-coordinates.js'); }

	/**
	 * @returns {GeoFeature}
	 * @namespace TI.Map.Featire
	 * @constructor
	 */
	static get Feature() { return require('./geo-feature.js'); }

	/**
	 * @returns {GeoFeatureCollection}
	 * @namespace TI.Map.FeatureList
	 * @constructor
	 */
	static get FeatureList() { return require('./geo-feature-list.js'); }

	/**
	 * @returns {Point}
	 * @namespace TI.Map.Point
	 * @constructor
	 */
	static get Point() { return require('./geo-point.js'); }

	/**
	 * @returns {Route}
	 * @namespace TI.Map.Route
	 * @constructor
	 */
	static get Route() { return require('./geo-route.js'); }

	/**
	 * @returns {Track}
	 * @namespace TI.Map.Track
	 * @constructor
	 */
	static get Track() { return require('./geo-track.js'); }

	/**
	 * @returns {Geometry}
	 * @namespace TI.Map.Geometry
	 * @constructor
	 */
	static get Geometry() { return require('./geometry.js'); }

	/**
	 * @returns {GPX}
	 * @namespace TI.Map.Helper
	 * @constructor
	 */
	static get Helper() { return require('./gpx-helper.js'); }

	/**
	 * @returns {Line}
	 * @namespace TI.Map.Line
	 * @constructor
	 */
	static get Line() { return require('./gpx-line.js'); }

	/**
	 * @returns {Location}
	 * @namespace TI.Map.Location
	 * @constructor
	 */
	static get Location() { return require('./gpx-location.js'); }
}

/**
 * @returns {GeoJSON}
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