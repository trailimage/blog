'use strict';

const DataBase = require('./../photo-base');
const InstagramFactory = require('./instagram-factory.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {EventEmitter}
 * @extends {PhotoBase}
 */
class InstagramData extends DataBase {
	constructor(options) {
		super(new InstagramFactory());
		log.info('Constructing Instagram service');
	}
}

module.exports = InstagramData;