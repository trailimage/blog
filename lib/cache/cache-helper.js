'use strict';

const is = require('../is.js');
const MemoryCache = require('./memory-cache.js');
const CacheBase = require('./cache-base.js');

/**
 * Convenience methods for interacting with cache providers
 */
class CacheHelper {
	/**
	 * @param {CacheBase} db
	 */
	constructor(db) {
		// assign in constructor instead of module to avoid circular dependency with the provider manager
		log = require('../config.js').provider.log;

		this.provider = db;
		/**
		 * Record actions while provider is trying to connect so they can be executed
		 * against a fallback provider if needed
		 * @type {Object[]}
		 * @private
		 */
		this._pendingAction = [];

		if (!(db instanceof MemoryCache)) {
			// configure fail-over to memory provider
			// reset pending actions when connected
			db.once(CacheBase.eventType.CONNECTED, () => { this._pendingAction = []; });
			db.once(CacheBase.eventType.FATAL, () => {
				log.error("Failing over to in-memory hash");
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
		let db = this.provider;
		let callback = (p3 === undefined)
			? is.callable(p2) ? p2 : null
			: p3;

		if (is.empty(key)) {
			log.error('Attempt to delete hash item with empty key');
			callback(false);
		} else if (is.value(p3) || !(is.callable(p2))) {
			// implies that hash field is the second argument
			if ((is.array(p2) && p2.length === 0) || is.empty(p2)) {
				log.error('Attempt to delete "%s" field with empty field name', key);
				callback(false);
			} else {
				// success cannot be measured by number of deleted records (dataType.count)
				// because post refresh blindly sends all keys for deletion without
				// knowing if they're actually cached
				db.removeMember(key, p2, db.responder(p2, callback, CacheBase.dataType.NONE));
			}
		} else {
			db.remove(key, db.responder(key, callback, CacheBase.dataType.COUNT));
		}
	}

	/**
	 * Whether key or hash key exists
	 * @param {String} key
	 * @param {String|function(Boolean)} p2 Hash key or callback
	 * @param {function(Boolean)} [p3] Callback if hash key supplied
	 */
	exists(key, p2, p3) {
		let db = this.provider;

		if (p3 === undefined) {
			// p2 is the callback
			db.exists(key, db.responder(key, p2, CacheBase.dataType.BIT));
		} else {
			// p2 is a field name, p3 is the callback
			db.memberExists(key, p2, db.responder(key, p3, CacheBase.dataType.BIT));
		}
	}

	/**
	 * All hash keys
	 * @param {String} key
	 * @param {function(String[])} callback
	 * @see http://redis.io/commands/keys
	 */
	keys(key, callback) {
		let db = this.provider;

		if (/[\?\*\[\]]/.test(key)) {
			// pattern match against root keys
			db.keys(key, db.responder(key, callback, CacheBase.dataType.RAW));
		} else {
			// all fields of a hash key
			db.memberKeys(key, db.responder(key, callback, CacheBase.dataType.RAW));
		}
	}

	/**
	 * Return raw value
	 * @param {String} key
	 * @param {String|function(Object)} p2 Hash key or callback
	 * @param {function(Object)} [p3] Callback if hash key given
	 */
	get(key, p2, p3) { this._getValue(CacheBase.dataType.RAW, key, p2, p3); }

	/**
	 * Get key or hash field value as an object
	 * @param {String} key
	 * @param {String|function(Object)} [p2] Hash key or callback
	 * @param {function(Object)} [p3] Callback if hash key given
	 */
	getObject(key, p2, p3) { this._getValue(CacheBase.dataType.JSON, key, p2, p3); }

	/**
	 * Get key or hash field value as given type
	 * @param {Number} type Reply type
	 * @param {String} key
	 * @param {String|function(Object)} [p2] Hash key or callback
	 * @param {function(Object)} [p3] Callback if hash key given
	 * @private
	 */
	_getValue(type, key, p2, p3) {
		let db = this.provider;

		if (p3 === undefined) {
			db.select(key, db.responder(key, p2, type));   // http://redis.io/commands/get
		} else {
			db.selectMember(key, p2, db.responder(key, p3, type));
		}
	}

	/**
	 * Get all items of a hash
	 * @param {String} key
	 * @param {function(Object|String)} callback
	 */
	getAll(key, callback) {
		let db = this.provider;
		db.selectAll(key, db.responder(key, callback, CacheBase.dataType.RAW));
	};

	/**
	 * Add value to key or hash key
	 * @param {String} key
	 * @param {String|Object} p2 Key value or member key
	 * @param {String|Object|function(Boolean)} [p3] Member value or callback
	 * @param {function(Boolean)} [p4] Callback
	 */
	add(key, p2, p3, p4) {
		let db = this.provider;

		if (!db.connected) { this._pendingAction.push({ add: arguments }); }

		if (p4 !== undefined || (p3 !== undefined && !(p3 instanceof Function))) {
			db.addMember(key, p2, db.normalize(p3), db.responder(key, p4, CacheBase.dataType.NONE));
		} else if (p3 !== undefined) {
			db.add(key, db.normalize(p2), db.responder(key, p3, CacheBase.dataType.OKAY));
		} else if (p2 !== undefined) {
			db.add(key, db.normalize(p2));
		}
	};

	/**
	 * Add all hash items
	 * @param {String} key
	 * @param {Object} hash Name-value pairs
	 * @param {function(Boolean)} [callback]
	 */
	addAll(key, hash, callback) {
		let db = this.provider;

		if (!db.connected) { this._pendingAction.push({ addAll: arguments }); }
		db.addAll(key, hash, db.responder(key, callback, CacheBase.dataType.OKAY));
	};
}

module.exports = CacheHelper;

// - Private static members

/**
 * @type {LogBase}
 */
let log = null;