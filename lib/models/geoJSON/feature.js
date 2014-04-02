var util = require('util');
var GeoJSON = require('./base.js');

function Feature() { GeoJSON.call(this); }

/**
 * @type {String}
 */
Feature.prototype.id;

/**
 * @type {Geometry}
 */
Feature.prototype.geometry;

/** @see {@link http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor} */
util.inherits(Feature, GeoJSON);

exports = Feature;
