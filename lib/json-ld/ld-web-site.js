'use strict';

const { creativeWork, Type } = require('./');

// http://schema.org/WebSite
module.exports = creativeWork.extend(Type.webSite);