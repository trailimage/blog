'use strict';

var setting = require('./../settings.js');
var format = require('./../format.js');
var is = require('./../is.js');
var log = require('winston');
var redis = require('redis').createClient(setting.redis.port, setting.redis.hostname);

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

redis.on('error', err => { log.error("Error during redis call: %s", err.toString()); });
redis.on('connect', authorize);

authorize();

/**
 * Remove key or key field (hash) from storage
 * @param {String|String[]} key
 * @param {String|String[]|function(Boolean)} [p2] Hash key or callback
 * @param {function(Boolean)} [p3] Callback if hash key given
 */
exports.remove = (key, p2, p3) => {
	var callback = (p3 === undefined)
		? (p2 instanceof Function) ? p2 : null
		: p3;

	if (is.empty(key)) {
		log.error('Attempt to delete hash item with empty key');
		callback(false);
	} else if (p3 !== undefined || !(p2 instanceof Function)) {
		// implies that hash field is the second argument
		if ((p2 instanceof Array && p2.length === 0) || format.isEmpty(p2)) {
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
			redis.hdel([key].concat(p2), responder(p2, callback, replyType.none));
		}
	} else {
		redis.del(key, responder(key, callback, replyType.count));
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
		redis.exists(key, responder(key, p2, replyType.bit));
	} else {
		// p2 is a field name, p3 is the callback
		redis.hexists(key, p2, responder(key, p3, replyType.bit));
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
		redis.keys(key, responder(key, callback, replyType.raw));
	} else {
		// all fields of a hash key
		redis.hkeys(key, responder(key, callback, replyType.raw));
	}
};

/**
 * Return raw value
 * @param {String} key
 * @param {String|function(Object)} p2 Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
exports.get = (key, p2, p3) => { get(replyType.raw, key, p2, p3); };

/**
 * Get key or hash field value as an object
 * @param {String} key
 * @param {String|function(Object)} [p2] Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
exports.getObject = (key, p2, p3) => { get(replyType.json, key, p2, p3); };

/**
 * Get key or hash field value as given type
 * @param {Number} type Reply type
 * @param {String} key
 * @param {String|function(Object)} [p2] Hash key or callback
 * @param {function(Object)} [p3] Callback if hash key given
 */
function get(type, key, p2, p3) {
	if (p3 === undefined) {
		redis.get(key, responder(key, p2, type));   // http://redis.io/commands/get
	} else {
		redis.hget(key, p2, responder(key, p3, type));
	}
}

/**
 * Get all items of a hash
 * @param {String} key
 * @param {function(Object)} callback
 */
exports.getAll = (key, callback) => {
	redis.hgetall(key, responder(key, callback, replyType.raw));
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
				console.log("MULTI got " + replies.length + " replies");
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
				console.log("MULTI got " + replies.length + " replies");
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
		redis.hset(key, p2, normalize(p3), responder(key, p4, replyType.none));
	} else if (p3 !== undefined) {
		redis.set(key, normalize(p2), responder(key, p3, replyType.okay));
	} else if (p2 !== undefined) {
		redis.set(key, normalize(p2));
	}
};

/**
 * Add all hash items
 * @param {String} key
 * @param {Object} hash Name-value pairs
 * @param {function(Boolean)} [callback]
 */
exports.addAll = (key, hash, callback) => {
	redis.hmset(key, hash, responder(key, callback, replyType.okay));
};

// - Responders ---------------------------------------------------------------

/**
 * Closure that returns redis response checker
 * @param {String|String[]} key
 * @param {function(String|String[]|Object|Boolean)} callback
 * @param {Number} [type] Optionally validate against expected result type
 * @returns {function(Boolean|String|Object)}
 */
function responder(key, callback, type) {
	return function(err, reply) {
		var error = hasError(key, err);

		if (callback) {
			var response = !error;

			if (!error) {
				if (type === undefined) { type = replyType.none; }

				switch (type) {
					case replyType.bit: response = (reply == 1); break;
					case replyType.okay: response = (reply == 'OK'); break;
					case replyType.count: response = (reply == howMany(key)); break;
					case replyType.raw: response = reply; break;
					case replyType.json: response = (reply) ? JSON.parse(reply) : null; break;
				}
			}
			callback(response);
		}
	}
}

// - Private methods ----------------------------------------------------------

function authorize() { redis.auth(setting.redis.auth); }

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
function howMany(key) { return (key instanceof Array) ? key.length : 1; }

/**
 * Whether Redis returned an error
 * @param {String|String[]} key
 * @param {Object} err
 * @return {Boolean}
 */
function hasError(key, err) {
	if (err != null) {
		if (key instanceof Array) { key = key.toString(); }
		log.error('Operation with key "%s" resulted in %s', key, err.toString());
		return true;
	}
	return false;
}