var util = require('util');
var GeoJSON = require('./base.js');

function Geometry() { GeoJSON.call(this); }

/**
 * @type {Array}
 * @see http://geojson.org/geojson-spec.html#positions
 */
Geometry.prototype.coordinates;

/** @see {@link http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor} */
util.inherits(Geometry, GeoJSON);

exports = Geometry;