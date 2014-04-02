/**
 * @fileoverview Externs for geoJSON
 * @see http://geojson.org/geojson-spec.html
 * @externs
 */
GeoJSON = {};

/**
 * @type {String}
 */
GeoJSON.prototype.type;

/**
 * @type {GeoJSON.CoordinateReferenceSystem}
 */
GeoJSON.prototype.crs;

/**
 * @type {GeoJSON.Feature[]}
 */
GeoJSON.prototype.features;

/**
 * @type {Array}
 */
GeoJSON.prototype.bbox;


// Geometries -----------------------------------------------------------------

/**
 * @type {Object}
 * @extends {GeoJSON}
 */
GeoJSON.prototype.Geometry;

/**
 * @type {Array}
 */
GeoJSON.Geometry.prototype.coordinates;

// Feature --------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {GeoJSON}
 */
GeoJSON.prototype.Feature;

/**
 * @type {GeoJSON.Geometry}
 */
GeoJSON.Feature.prototype.geometry;

/**
 * @type {String}
 */
GeoJSON.Feature.prototype.id;

/**
 * @type {Object}
 */
GeoJSON.Feature.prototype.properties;

// Coordinate reference system ------------------------------------------------

/**
 * @type {Object}
 * @extends {GeoJSON}
 */
GeoJSON.prototype.CoordinateReferenceSystem;

/**
 * @type {Object}
 */
GeoJSON.CoordinateReferenceSystem.prototype.properties;