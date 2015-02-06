"use strict";

var setting = require('./../settings.js');
var format = require('./../format.js');
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

redis.on('error', function(err) { log.error("Error during redis call: %s", err.toString()); });
redis.on('connect', authorize);

authorize();

/**
 * Remove key or key field (hash) from storage
 * @param {String|String[]} key
 * @param {String|String[]|function(Boolean)} [p2]
 * @param {function(Boolean)} [p3]
 */
exports.remove = function(key, p2, p3) {
	var callback = (p3 === undefined)
		? (p2 instanceof Function) ? p2 : null
		: p3;

	if (format.isEmpty(key)) {
		log.error('Attempt to delete hash item with empty key');
		callback(false);
	} else if (p3 !== undefined || !(p2 instanceof Function)) {
		// implies that hash field is the second argument
		if ((p2 instanceof Array && p2.length == 0) || format.isEmpty(p2)) {
			log.error('Attempt to delete "%s" field with empty field name', key);
			callback(false);
		} else {
			//var args = [key];
			//if (p2 instanceof Array) { args = args.concat(p2); } else { args.push(p2); }

			redis.hdel(key, p2, responder(p2, callback, replyType.count));
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
exports.exists = function(key, p2, p3) {
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
exports.keys = function(key, callback) {
	if (/[\?\*\[\]]/.test(key)) {
		// pattern match against root keys
		redis.keys(key, responder(key, callback, replyType.raw));
	} else {
		// all fields of a hash key
		redis.hkeys(key, responder(key, callback, replyType.raw));
	}
};

/**
 * @param {String} key
 * @param {String|function(Object)} p2
 * @param {function(Object)} [p3]
 */
exports.get = function(key, p2, p3) { get(replyType.raw, key, p2, p3); };

/**
 * Get key or hash field value as an object
 * @param {String} key
 * @param {String|function(Object)} [p2]
 * @param {function(Object)} [p3]
 */
exports.getObject = function(key, p2, p3) { get(replyType.json, key, p2, p3); };

/**
 * Get key or hash field value as an object
 * @param {Number} type Reply type
 * @param {String} key
 * @param {String|function(Object)} [p2]
 * @param {function(Object)} [p3]
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
exports.getAll = function(key, callback) {
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
exports.replace = function(key, p2, p3, p4, p5) {
	if (p5 === undefined) {
		redis.multi()
			.del(key)
			.set(p2, normalize(p3))
			.exec(function(err, replies) {
				console.log("MULTI got " + replies.length + " replies");
				replies.forEach(function(reply, index) {
					console.log("Reply " + index + ": " + reply.toString());
				});
			});
	} else {
		// hash
		redis.multi()
			.hdel(key, p2)
			.hset(key, p3, normalize(p4))
			.exec(function(err, replies) {
				console.log("MULTI got " + replies.length + " replies");
				replies.forEach(function(reply, index) {
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
exports.add = function(key, p2, p3, p4) {
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
exports.addAll = function(key, hash, callback) {
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
		var error = hasError(key, err, type);

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
 * @param {String|String[]} key
 * @param {Object} err
 * @param {Number} [type] optionally validate against expected result type
 * @return {Boolean}
 */
function hasError(key, err, type) {
	if (err != null) {
		if (key instanceof Array) { key = key.toString(); }
		log.error('Operation with key "%s" resulted in %s', key, err.toString());
		return true;
	}
	return false;
}