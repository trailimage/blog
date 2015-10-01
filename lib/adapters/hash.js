'use strict';

const setting = require('./../settings.js');
const is = require('./../is.js');
const log = require('./../log.js');
const Redis = require('./redis.js');
const Memory = require('./memory.js');

let db = new Redis();

/**
 * Expected hash response used for validation and parsing
 * @enum {Number}
 */
const replyType = {
	none: 0,            // don't check the reply
	okay: 1,            // check for 'OK'
	count: 2,           // reply should match key count
	bit: 3,             // 1 or 0
	raw: 4,             // return raw data without validation or parsing
	json: 5             // parse as JSON
};


/**
 * Remove key or key field (hash) from storage
 * @param {String|String[]} key
 * @param {String|String[]|function(Boolean)} [p2] Hash key or callback
 * @param {function(Boolean)} [p3] Callback if hash key given
 */
exports.remove = (key, p2, p3) => {
	var callback = (p3 === undefined)
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
			// node redis is a little dumb here and merely toString()'s the field
			// array if passed as a second argument so instead combine the key
			// and fields which get converted into a list of arguments which is
			// what redis server hdel actuall expects

			// success cannot be measured by number of deleted records (replyType.count)
			// because post refresh blindly sends all keys for deletion without
			// knowing if they're actually stored in redis
			db.remove([key].concat(p2), db.responder(p2, callback, replyType.none));
		}
	} else {
		db.remove(key, db.responder(key, callback, replyType.count));
	}
};

/**
 * Whether key or hash key exists
 * @param {String} key
 * @param {String|function(Boolean)} p2 Hash key or callback
 * @param {function(Boolean)} [p3] Callback if hash key supplied
 */
exports.exists = (key, p2, p3) => {
	if (p3 === undefined) {
		// p2 is the callback
		db.exists(key, db.responder(key, p2, replyType.bit));
	} else {
		// p2 is a field name, p3 is the callback
		db.memberExists(key, p2, db.responder(key, p3, replyType.bit));
	}
};

// - Getters ------------------------------------------------------------------

/**
 * All hash keys
 * @param {String} key
 * @param {function(String[])} callback
 * @see http://redis.io/commands/keys
 */
exports.keys = (key, callback) => {
	if (/[\?\*\[\]]/.test(key)) {
		// pattern match against root keys
		db.keys(key, db.responder(key, callback, replyType.raw));
	} else {
		// all fields of a hash key
		db.memberKeys(key, db.responder(key, callback, replyType.raw));
	}
};

/**
 * Return raw value
 * @param {String} key
 * @param {String|function(Object)} p2 Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
exports.get = (key, p2, p3) => { getValue(replyType.raw, key, p2, p3); };

/**
 * Get key or hash field value as an object
 * @param {String} key
 * @param {String|function(Object)} [p2] Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
exports.getObject = (key, p2, p3) => { getValue(replyType.json, key, p2, p3); };

/**
 * Get key or hash field value as given type
 * @param {Number} type Reply type
 * @param {String} key
 * @param {String|function(Object)} [p2] Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
function getValue(type, key, p2, p3) {
	if (p3 === undefined) {
		db.select(key, db.responder(key, p2, type));   // http://redis.io/commands/get
	} else {
		db.selectMember(key, p2, db.responder(key, p3, type));
	}
}

/**
 * Get all items of a hash
 * @param {String} key
 * @param {function(Object)} callback
 */
exports.getAll = (key, callback) => {
	db.selectAll(key, db.responder(key, callback, replyType.raw));
};

// - Setters ------------------------------------------------------------------

/**
 * Delete one key and add another
 * @param {String} key Hash key or old string key
 * @param {String} p2 Old hash field or new string key
 * @param {String|Object} p3 New hash field or value
 * @param {String|Object|function(boolean)} p4 Hash value or callback
 * @param {function(boolean)} [p5] Callback if replacing hash field
 */
exports.replace = (key, p2, p3, p4, p5) => {
	if (p5 === undefined) {
		redis.multi()
			.del(key)
			.set(p2, normalize(p3))
			.exec((err, replies) => {
				log.info('MULTI got %d replies', replies.length);
				replies.forEach((reply, index) => {
					console.log("Reply " + index + ": " + reply.toString());
				});
			});
	} else {
		// hash
		redis.multi()
			.hdel(key, p2)
			.hset(key, p3, normalize(p4))
			.exec((err, replies) => {
				log.info('MULTI got %d replies', replies.length);
				replies.forEach((reply, index) => {
					console.log("Reply " + index + ": " + reply.toString());
				});
			});
	}
};

/**
 * Add value to key or hash key
 * @param {String} key
 * @param {String|Object} p2 Key value or hash field
 * @param {String|Object|function(Boolean)} [p3] Hash field value or callback
 * @param {function(Boolean)} [p4] Callback
 */
exports.add = (key, p2, p3, p4) => {
	if (p4 !== undefined || (p3 !== undefined && !(p3 instanceof Function))) {
		db.addMember(key, p2, normalize(p3), db.responder(key, p4, replyType.none));
	} else if (p3 !== undefined) {
		db.add(key, normalize(p2), db.responder(key, p3, replyType.okay));
	} else if (p2 !== undefined) {
		db.add(key, normalize(p2));
	}
};

/**
 * Add all hash items
 * @param {String} key
 * @param {Object} hash Name-value pairs
 * @param {function(Boolean)} [callback]
 */
exports.addAll = (key, hash, callback) => {
	db.addAll(key, hash, db.responder(key, callback, replyType.okay));
};

// - Private members ----------------------------------------------------------

/**
 * Normalize data value
 * @param {Object|String|Array} value
 */
function normalize(value) { return (typeof value == 'object') ? JSON.stringify(value) : value; }

/**
 * How many datum referenced by key
 * @param {String|String[]} key
 * @returns {Number}
 */
function howMany(key) { return is.array(key) ? key.length : 1; }