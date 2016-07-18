'use strict';

const { thing, Type } = require('./');

// http://schema.org/Duration
// https://en.wikipedia.org/wiki/ISO_8601
module.exports = thing.extend(Type.duration);