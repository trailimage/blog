'use strict';

const PhotoBase = require('./../photo-base');
const FacebookFactory = require('./facebook-factory.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {EventEmitter}
 * @extends {PhotoBase}
 * @see https://developers.facebook.com/docs/graph-api/reference/v2.5/album
 * @see https://github.com/node-facebook/facebook-node-sdk
 */
class FacebookPhoto extends PhotoBase {
	constructor(options) {
		super(new FacebookFactory());
		log.info('Constructing Facebook service');
	}
}

module.exports = FacebookPhoto;