var Setting = require('./../settings.js');
var log = require('winston');
/** @type {RedisClient} */
var redis = require('redis').createClient(Setting.redis.port, Setting.redis.hostname);

redis.on('error', function(err) { log.error("Could not connect to redis: %s", err.toString()); });
redis.on('connect', authorize);

authorize();

/**
 * @param {String|String[]} keys
 * @param {function(Boolean)} [callback]
  */
exports.remove = function(keys, callback)
{
	redis.del(keys, function(err, reply)
	{
		var expected = (keys instanceof Array) ? keys.length : 1;
		answer(keys, err, reply, callback, expected);
	});
};

/**
 * @param {String} key
 * @param {function(Boolean)} callback
 */
exports.exists = function(key, callback)
{
	redis.exists(key, function(err, reply)
	{
		answer(key, err, reply, callback, 1);
	});
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

exports.getObject = function(key, p2, p3)
{
	var callback = (p3 === undefined) ? p2 : p3;

	if (p3 === undefined)
	{
		redis.get(key, function(err, reply) { replyAsObject(key, err, reply, callback);	});
	}
	else
	{
		redis.hget(key, p2, function(err, reply) { replyAsObject(key, err, reply, callback); });
	}

};

/**
 * Get all items of a table or hash
 * @param {String} key
 * @param {function(Object)} callback
 */
exports.getAll = function(key, callback)
{
	redis.hgetall(key, function(err, reply)
	{
		if (!hasError('get', key, err) && reply != null)
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
 * @param {String} key
 * @param {String|Object|function(Boolean)} p2
 * @param {String|function(Boolean)} [p3]
 * @param {function(Boolean)} [p4]
 */
exports.add = function(key, p2, p3, p4)
{
	var callback = null;

	if (p4 !== undefined)
	{
		callback = p4;

		redis.hset(key, p2, normalize(p3), function(err, reply)
		{
			answer(key, err, reply, callback);
		});
	}
	else if (p3 !== undefined)
	{
		callback = p3;

		redis.set(key, normalize(p2), function(err, reply)
		{
			answer(key, err, reply, callback, 'OK');
		});
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
 * @return {Cloud}
 */
exports.addAll = function(key, hash, callback)
{
	redis.hmset(key, hash, function(err, reply)
	{
		answer(key, err, reply, callback);
	});
};


// - Private methods ----------------------------------------------------------

function authorize() { redis.auth(Setting.redis.auth); }

/**
 * @param {Object|String|Array} value
 */
function normalize(value)
{
	return (typeof value == 'object') ? JSON.stringify(value) : value;
}

/**
 * Execute callback indicating if response was successful
 * @param {String|String[]} key
 * @param err
 * @param {String} reply
 * @param {function(Boolean)} [callback]
 * @param {String|Number} [expected] Expected reply
 */
function answer(key, err, reply, callback, expected)
{
	var problem = hasError('save', key, err) || (expected !== undefined && reply != expected);
	if (callback) { callback(!problem); }
}

/**
 * @param {String} key
 * @param {Object} err
 * @param {Object} reply
 * @param {function(Object)} callback
 */
function replyAsObject(key, err, reply, callback)
{
	if (!hasError('get', key, err) && reply != null)
	{
		callback(JSON.parse(reply));
	}
	else
	{
		callback(null);
	}
}

/**
 * @param {String} verb
 * @param {String|String[]} key
 * @param {Object} err
 * @return {Boolean}
 */
function hasError(verb, key, err)
{
	if (key instanceof Array) { key = key.toString(); }

	if (err != null)
	{
		log.error('Trying to %s %s resulted in %s', verb, key, err, {});
		return true;
	}
	return false;
}