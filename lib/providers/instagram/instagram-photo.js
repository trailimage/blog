'use strict';

const TI = require('../../');
const PhotoBase = TI.Provider.Photo.Base;
const InstagramFactory = TI.Factory.Instagram;
const log = TI.active.log;

/**
 * @alias TI.Photo.Provider.Instagram
 * @extends {EventEmitter}
 * @extends {PhotoBase}
 */
class InstagramPhoto extends PhotoBase {
	constructor(options) {
		super(new InstagramFactory());
		log.info('Constructing Instagram service');
	}
}

module.exports = InstagramPhoto;