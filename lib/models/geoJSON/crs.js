var util = require('util');
var GeoJSON = require('./base.js');

function CoordinateReferenceSystem() { GeoJSON.call(this); }

/** @see {@link http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor} */
util.inherits(CoordinateReferenceSystem, GeoJSON);


