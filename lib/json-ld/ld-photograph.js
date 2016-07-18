'use strict';

const { creativeWork, Type } = require('./');

// http://schema.org/Photograph
module.exports = creativeWork.extend(Type.photograph);