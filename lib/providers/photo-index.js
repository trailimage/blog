'use strict';

/**
 * @namespace
 * @name PhotoProviderNamespace
 * @property {PhotoBase} Base
 * @property {FlickrPhoto} Flickr
 * @property {InstagramPhoto} Instagram
 */
class PhotoProviderNamespace {
	/**
	 * @returns {PhotoBase}
	 * @constructor
	 */
	static get Base() { return require('./photo-base.js'); }

	/**
	 * @returns {FlickrPhoto}
	 * @constructor
	 */
	static get Flickr() { return require('./flickr/flickr-photo.js'); }

	/**
	 * @returns {InstagramPhoto}
	 * @constructor
	 */
	static get Instagram() { return require('./instagram/instagram-photo.js'); }
}

module.exports = PhotoProviderNamespace;