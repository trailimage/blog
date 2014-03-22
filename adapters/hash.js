var setting = require('./../settings.js');
var log = require('winston');
var redis = require('redis').createClient(setting.redis.port, setting.redis.hostname);

redis.on('error', function(err) { log.error("Could not connect to redis: %s", err.toString()); });
redis.on('connect', authorize);

authorize();

/**
 * Remove key or key field (hash) from storage
 * @param {String|String[]} keys
 * @param {String|String[]|function(Boolean)} [p2]
 * @param {function(Boolean)} [p3]
 */
exports.remove = function(keys, p2, p3)
{
	var callback = (p3 === undefined)
		? (p2 instanceof Function) ? p2 : null
		: p3;

	if (p3 !== undefined || !(p2 instanceof Function))
	{
		// implies that hash field is the second argument
		redis.hdel(keys, p2, responder(keys, callback, p2));
	}
	else
	{
		redis.del(keys, responder(keys, callback));
	}
};

/**
 * Whether key or key field exists
 * @param {String} key
 * @param {String|function(Boolean)} p2
 * @param {function(Boolean)} [p3]
 */
exports.exists = function(key, p2, p3)
{
	if (p3 === undefined)
	{
		// p2 is the callback
		redis.exists(key, responder(key, p2));
	}
	else
	{
		// p2 is a field name, p3 is the callback
		redis.hexists(key, p2, responder(key, p3));
	}
};

// - Getters ------------------------------------------------------------------

/**
 * @param {String} key
 * @param {String|function(Object)} p2
 * @param {function(Object)} [p3]
 */
exports.get = function(key, p2, p3)
{
	var callback = (p3 === undefined) ? p2 : p3;

	if (p3 === undefined)
	{
		redis.get(key, function(err, reply) { callback(reply); });
	}
	else
	{
		redis.hget(key, p2, function(err, reply) { callback(reply); });
	}
};

/**
 * @param {string} key
 * @param {string|function(Object)} [p2]
 * @param {function(Object)} [p3]
 */
exports.getObject = function(key, p2, p3)
{
	var callback = (p3 === undefined) ? p2 : p3;

	if (p3 === undefined)
	{
		redis.get(key, objectResponder(key, callback));
	}
	else
	{
		redis.hget(key, p2, objectResponder(key, callback));
	}
};

/**
 * Get all items of a hash
 * @param {String} key
 * @param {function(Object)} callback
 */
exports.getAll = function(key, callback)
{
	redis.hgetall(key, function(err, reply)
	{
		if (!hasError(key, err) && reply != null)
		{
			callback(reply);
		}
		else
		{
			callback(null);
		}
	});
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
exports.replace = function(key, p2, p3, p4, p5)
{
	if (p5 === undefined)
	{
		redis.multi()
			.del(key)
			.set(p2, normalize(p3))
			.exec(function(err, replies)
			{
				console.log("MULTI got " + replies.length + " replies");
				replies.forEach(function (reply, index)
				{
					console.log("Reply " + index + ": " + reply.toString());
				});
			});
	}
	else
	{
		// hash
		redis.multi()
			.hdel(key, p2)
			.hset(key, p3, normalize(p4))
			.exec(function(err, replies)
			{
				console.log("MULTI got " + replies.length + " replies");
				replies.forEach(function (reply, index)
				{
					console.log("Reply " + index + ": " + reply.toString());
				});
			});
	}
};

/**
 * @param {String} key
 * @param {String|Object|function(Boolean)} p2
 * @param {String|function(Boolean)} [p3]
 * @param {function(Boolean)} [p4]
 */
exports.add = function(key, p2, p3, p4)
{
	if (p4 !== undefined)
	{
		redis.hset(key, p2, normalize(p3), responder(key, p4));
	}
	else if (p3 !== undefined)
	{
		redis.set(key, normalize(p2), responder(key, p3));
	}
	else if (p2 !== undefined)
	{
		redis.set(key, normalize(p2));
	}
};

/**
 * Add all hash items or rows
 * @param {String} key
 * @param {Object} hash
 * @param {function(Boolean)} [callback]
 */
exports.addAll = function(key, hash, callback)
{
	redis.hmset(key, hash, responder(key, callback));
};

// - Responders ---------------------------------------------------------------

/**
 * Closure that returns redis response checker
 * @param {String|String[]} key
 * @param {function(boolean)} callback
 * @param {String|String[]} [field]
 * @returns {Function}
 */
function responder(key, callback, field)
{
	var expected = (field === undefined) ? howMany(key) : howMany(field);

	return function(err, reply)
	{
		var problem = hasError(key, err); // || reply != expected;
		if (callback) { callback(!problem); }
	}
}

/**
 * Closure that returns value as object
 * @param {String|String[]} key
 * @param {function(Object)} [callback]
 * @returns {Function}
 */
function objectResponder(key, callback)
{
	return function(err, reply)
	{
		if (callback)
		{
			if (!hasError(key, err) && reply != null)
			{
				callback(JSON.parse(reply));
			}
			else
			{
				callback(null);
			}
		}
	}
}

// - Private methods ----------------------------------------------------------

function authorize() { redis.auth(setting.redis.auth); }

/**
 * @param {Object|String|Array} value
 */
function normalize(value) {	return (typeof value == 'object') ? JSON.stringify(value) : value; }

/**
 * How many datum referenced by key
 * @param {String|String[]} key
 * @returns {Integer}
 */
function howMany(key) { return (key instanceof Array) ? key.length : 1; }

/**
 * @param {String|String[]} key
 * @param {Object} err
 * @return {Boolean}
 */
function hasError(key, err)
{
	if (err != null)
	{
		if (key instanceof Array) { key = key.toString(); }
		log.error('Method with %s resulted in %s', key, err.toString());
		return true;
	}
	return false;
}