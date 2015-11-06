'use strict';

const DataBase = require('./../photo-base');
const FacebookFactory = require('./facebook-factory.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {EventEmitter}
 * @extends {PhotoBase}
 */
class FacebookData extends DataBase {
	constructor(options) {
		super(new FacebookFactory());
		log.info('Constructing Facebook service');
	}
}

module.exports = FacebookData;