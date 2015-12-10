'use strict';

const app = require('../index.js');
const Cache = require('./index.js');
const is = app.is;
const MemoryCache = Cache.Memory;
/** @type {ProviderManager} */
let db = null;

/**
 * Convenience methods for interacting with cache providers
 */
class CacheHelper {
	/**
	 * @param {CacheBase|EventEmitter} p
	 */
	constructor(p) {
		db = app.provider;

		this.provider = p;
		/**
		 * Record actions while provider is trying to connect so they can be executed
		 * against a fallback provider if needed
		 * @type {Object[]}
		 * @private
		 */
		this._pendingAction = [];

		if (!(p instanceof MemoryCache)) {
			// configure fail-over to memory provider
			// reset pending actions when connected
			p.once(Cache.Base.EventType.CONNECTED, () => { this._pendingAction = []; });
			p.once(Cache.Base.EventType.FATAL, () => {
				db.log.error("Failing over to in-memory hash");
				this.provider = new MemoryCache();
				// execute pending actions against the fallback provider
				for (let command of this._pendingAction) {
					for (let name in command) {
						this[name].apply(this, command[name]);
					}
				}
			});
		}
	}

	/**
	 * Remove key or key field (hash) from storage
	 * @param {String|String[]} key
	 * @param {String|String[]|function(Boolean)} [p2] Hash key or callback
	 * @param {function(Boolean)} [p3] Callback if hash key given
	 */
	remove(key, p2, p3) {
		let callback = (p3 === undefined)
			? is.callable(p2) ? p2 : null
			: p3;

		if (is.empty(key)) {
			db.log.error('Attempt to delete hash item with empty key');
			callback(false);
		} else if (!this.provider.connected) {
			db.log.warn('Attempt to delete "%s" field from disconnected cache', key);
			callback(false);
		} else if (is.value(p3) || !(is.callable(p2))) {
			// implies that hash field is the second argument
			if ((is.array(p2) && p2.length === 0) || is.empty(p2)) {
				db.log.error('Attempt to delete "%s" field with empty field name', key);
				callback(false);
			} else {
				// success cannot be measured by number of deleted records (dataType.count)
				// because post refresh blindly sends all keys for deletion without
				// knowing if they're actually cached
				this.provider.removeMember(key, p2, this.provider.responder(p2, callback, Cache.Base.DataType.NONE));
			}
		} else {
			this.provider.remove(key, this.provider.responder(key, callback, Cache.Base.DataType.COUNT));
		}
	}

	/**
	 * Whether key or hash key exists
	 * @param {String} key
	 * @param {String|function(Boolean)} p2 Hash key or callback
	 * @param {function(Boolean)} [p3] Callback if hash key supplied
	 */
	exists(key, p2, p3) {
		let p = this.provider;

		if (p3 === undefined) {
			// p2 is the callback
			p.exists(key, p.responder(key, p2, CacheBase.DataType.BIT));
		} else {
			// p2 is a field name, p3 is the callback
			p.memberExists(key, p2, p.responder(key, p3, CacheBase.DataType.BIT));
		}
	}

	/**
	 * All hash keys
	 * @param {String} key
	 * @param {function(String[])} callback
	 * @see http://redis.io/commands/keys
	 */
	keys(key, callback) {
		let p = this.provider;

		if (!p.connected) {
			db.log.warn('Attempted to get "%s" keys from disconnected cache', key);
			callback(null);
		} else {
			if (/[\?\*\[\]]/.test(key)) {
				// pattern match against root keys
				p.keys(key, p.responder(key, callback, Cache.Base.DataType.RAW));
			} else {
				// all fields of a hash key
				p.memberKeys(key, p.responder(key, callback, Cache.Base.DataType.RAW));
			}
		}
	}

	/**
	 * Return raw value
	 * @param {String} key
	 * @param {String|function(Object)} p2 Hash key or callback
	 * @param {function(Object)} [p3] Callback if hash key given
	 */
	get(key, p2, p3) { this._getValue(Cache.Base.DataType.RAW, key, p2, p3); }

	/**
	 * Get key or hash field value as an object
	 * @param {String} key
	 * @param {String|function(Object)} [p2] Hash key or callback
	 * @param {function(Object|Array)} [p3] Callback if hash key given
	 */
	getObject(key, p2, p3) { this._getValue(Cache.Base.DataType.JSON, key, p2, p3); }

	/**
	 * Get key or hash field value as given type
	 * @param {Number} type Reply type
	 * @param {String} key
	 * @param {String|function(Object)} [p2] Member key or callback
	 * @param {function(Object)} [p3] Callback if hash key given
	 * @private
	 */
	_getValue(type, key, p2, p3) {
		let p = this.provider;

		let callback = (p3 === undefined) ? p2 : p3;

		if (!p.connected) {
			db.log.warn('Attempted to get "%s" from disconnected cache', key);
			callback(null);
		} else {
			if (p3 === undefined) {
				p.select(key, p.responder(key, callback, type));   // http://redis.io/commands/get
			} else {
				p.selectMember(key, p2, p.responder(key, callback, type));
			}
		}
	}

	/**
	 * Get all items of a hash
	 * @param {String} key
	 * @param {function(Object|String)} callback
	 */
	getAll(key, callback) {
		let p = this.provider;

		if (!p.connected) {
			db.log.warn('Attempted to get "%s" from disconnected cache', key);
			callback(null);
		} else {
			p.selectAll(key, this.provider.responder(key, callback, CacheBase.DataType.RAW));
		}
	};

	/**
	 * Add value to key or hash key
	 * @param {String} key
	 * @param {String|Object} p2 Key value or member key
	 * @param {String|Object|function(Boolean)} [p3] Member value or callback
	 * @param {function(Boolean)} [p4] Callback
	 */
	add(key, p2, p3, p4) {
		let p = this.provider;

		if (!p.connected) { this._pendingAction.push({ add: arguments }); }

		if (p4 !== undefined || (p3 !== undefined && !(p3 instanceof Function))) {
			p.addMember(key, p2, p.normalize(p3), p.responder(key, p4, Cache.Base.DataType.NONE));
		} else if (p3 !== undefined) {
			p.add(key, p.normalize(p2), p.responder(key, p3, Cache.Base.DataType.OKAY));
		} else if (p2 !== undefined) {
			p.add(key, p.normalize(p2));
		}
	};

	/**
	 * Add all hash items
	 * @param {String} key
	 * @param {Object} hash Name-value pairs
	 * @param {function(Boolean)} [callback]
	 */
	addAll(key, hash, callback) {
		let p = this.provider;

		if (!p.connected) { this._pendingAction.push({ addAll: arguments }); }
		p.addAll(key, hash, p.responder(key, callback, Cache.Base.DataType.OKAY));
	};

	/**
	 * Add HTML output content
	 * @param {String} key Cache key
	 * @param {String} slug Post slug
	 * @param {Buffer} buffer Byte array
	 * @param {function(CacheItem)} [callback]
	 */
	addOutput(key, slug, buffer, callback) {
		let ci = new Cache.Item(slug, buffer);
		this.add(key, slug, ci, success => {
			if (is.callable(callback)) { callback(success ? ci : null); }
		});
	}
}

module.exports = CacheHelper;