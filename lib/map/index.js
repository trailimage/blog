'use strict';

class MapIndex {
	/**
	 * @returns {GeoJSON}
	 * @constructor
	 */
	static get Base() { return require('./geo-base.js'); }

	/**
	 * @returns {GeoCoordinates}
	 * @constructor
	 */
	static get Coordinates() { return require('./geo-coordinates.js'); }

	/**
	 * @returns {GeoFeature}
	 * @constructor
	 */
	static get Feature() { return require('./geo-feature.js'); }

	/**
	 * @returns {GeoFeatureCollection}
	 * @constructor
	 */
	static get FeatureList() { return require('./geo-feature-list.js'); }

	/**
	 * @returns {Point}
	 * @constructor
	 */
	static get Point() { return require('./geo-point.js'); }

	/**
	 * @returns {Route}
	 * @constructor
	 */
	static get Route() { return require('./geo-route.js'); }

	/**
	 * @returns {Track}
	 * @constructor
	 */
	static get Track() { return require('./geo-track.js'); }

	/**
	 * @returns {Geometry}
	 * @constructor
	 */
	static get Geometry() { return require('./geometry.js'); }

	/**
	 * @returns {GPX}
	 * @constructor
	 */
	static get Helper() { return require('./gpx-helper.js'); }

	/**
	 * @returns {Line}
	 * @constructor
	 */
	static get Line() { return require('./gpx-line.js'); }

	/**
	 * @returns {Location}
	 * @constructor
	 */
	static get Location() { return require('./gpx-location.js'); }
}

module.exports = MapIndex;