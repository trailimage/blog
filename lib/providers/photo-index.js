'use strict';

/**
 * @namespace
 * @alias TI.Provider.Photo
 */
class PhotoProviderNamespace {
	static get Base() { return require('./photo-base.js'); }
	static get Flickr() { return require('./flickr/flickr-photo.js'); }
	static get Instagram() { return require('./instagram/instagram-photo.js'); }
}

module.exports = PhotoProviderNamespace;