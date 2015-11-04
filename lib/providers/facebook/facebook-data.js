'use strict';

const DataBase = require('./../data-base');
const FacebookFactory = require('./facebook-factory.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {EventEmitter}
 * @extends {DataBase}
 */
class FacebookData extends DataBase {
	constructor(options) {
		super(new FacebookFactory());
		log.info('Constructing Facebook service');
	}
}

module.exports = FacebookData;