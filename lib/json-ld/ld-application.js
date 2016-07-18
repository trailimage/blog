'use strict';

const { thing, Type } = require('./');

// http://schema.org/SoftwareApplication
module.exports = thing.extend(Type.softwareApplication, {
	applicationCategory: null,
	applicationSuite: null,
	downloadUrl: null,
	operatingSystem: null,
	softwareVersion: null
});