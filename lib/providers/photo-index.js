'use strict';

/**
 * @namespace TI.Provider.Photo
 */
class PhotoProviderNamespace {
	/**
	 * @namespace TI.Provider.Photo.Base
	 * @returns {PhotoBase}
	 * @constructor
	 */
	static get Base() { return require('./photo-base.js'); }

	/**
	 * @namespace TI.Provider.Photo.Flickr
	 * @returns {FlickrPhoto}
	 * @constructor
	 */
	static get Flickr() { return require('./flickr/flickr-photo.js'); }

	/**
	 * @namespace TI.Provider.Photo.Instagram
	 * @returns {InstagramPhoto}
	 * @constructor
	 */
	static get Instagram() { return require('./instagram/instagram-photo.js'); }
}

module.exports = PhotoProviderNamespace;