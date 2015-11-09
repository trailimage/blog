'use strict';

/**
 * Output cache item
 */
class CacheItem {
	/**
	 * @param {String} key
	 * @param {String|Buffer} buffer
	 */
	constructor(key, buffer) {
		this.buffer = buffer;
		this.eTag = key + '_' + (new Date()).getTime().toString();
	}
}

module.exports = CacheItem;