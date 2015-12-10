'use strict';

const is = require('../').is;

/**
 * Output cache item
 */
class CacheItem {
	/**
	 * @param {String} key
	 * @param {String|Buffer} buffer
	 */
	constructor(key, buffer) {
		this.buffer = (typeof buffer === 'string') ? new Buffer(buffer, 'hex') : buffer;
		this.eTag = key + '_' + (new Date()).getTime().toString();
	}

	/**
	 * Create instance out of anonymous object
	 * @param {Object} item
	 * @returns {CacheItem}
	 */
	static deserialize(item) {
		let ci = new CacheItem('', item.buffer);
		ci.eTag = item.eTag;
		return ci;
	}

	/**
	 * Whether anonymous object matches this type
	 * @param {Object} o
	 * @return {Boolean}
	 */
	static isType(o) {
		return (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag'));
	}

	/**
	 * @return {String}
	 */
	serialize() {
		return JSON.stringify({	buffer: this.buffer.toString('hex'), eTag: this.eTag });
	}
}

module.exports = CacheItem;