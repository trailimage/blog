'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @alias TI.LinkData.Application
 * @see http://schema.org/SoftwareApplication
 */
class ApplicationSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.application; }
		super(type);

		/** @type String */
		this.applicationCategory = null;
		/** @type String */
		this.applicationSuite = null;
		/** @type String */
		this.downloadUrl = null;
		/** @type String */
		this.operatingSystem = null;
		/** @type String */
		this.softwareVersion = null;
	}
}

module.exports = ApplicationSchema;