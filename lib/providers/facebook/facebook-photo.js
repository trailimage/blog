'use strict';

const TI = require('../../');
const PhotoBase = TI.Provider.Photo.Base;
const FacebookFactory = TI.Factory.Facebook;
const log = TI.active.log;

/**
 * @extends EventEmitter
 * @extends PhotoProviderBase
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