var setting = require('./../settings.js');
var format = require('./../format.js');
var log = require('winston');
var redis = require('redis').createClient(setting.redis.port, setting.redis.hostname);
var schema = null;
/**
 * Expected hash response used for validation and parsing
 * @enum {Number}
 */
var replyType = {
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
 * Schema (really just a key prefix) at which to execute a redis call
 * Not thread-safe since schema is applied to subsequent method call
 * @param {String} s
 * @returns {Object}
 */
exports.at = function(s)
{
	schema = s;
	return exports;
};

/**
 * Remove key or key field (hash) from storage
 * @param {String|String[]} key
 * @param {String|String[]|function(Boolean)} [p2]
 * @param {function(Boolean)} [p3]
 */
exports.remove = function(key, p2, p3)
{
	key = schematize(key);

	var callback = (p3 === undefined)
		? (p2 instanceof Function) ? p2 : null
		: p3;

	if (format.isEmpty(key))
	{
		log.error('Attempt to delete hash item with empty key');
		callback(false);
	}
	else if (p3 !== undefined || !(p2 instanceof Function))
	{
		// implies that hash field is the second argument
		if ((p2 instanceof Array && p2.length == 0) || format.isEmpty(p2))
		{
			log.error('Attempt to delete "%s" field with empty field name', key);
			callback(false);
		}
		else
		{
			var args = [key];
			if (p2 instanceof Array) { args = args.concat(p2); } else { args.push(p2); }

			redis.hdel(args, responder(p2, callback, replyType.count));     // http://redis.io/commands/hdel
		}
	}
	else
	{
		redis.del(key, responder(key, callback, replyType.count));              // http://redis.io/commands/del
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
	key = schematize(key);

	if (p3 === undefined)
	{
		// p2 is the callback
		redis.exists(key, responder(key, p2, replyType.bit));                   // http://redis.io/commands/exists
	}
	else
	{
		// p2 is a field name, p3 is the callback
		redis.hexists(key, p2, responder(key, p3, replyType.bit));              // http://redis.io/commands/hexists
	}
};

// - Getters ------------------------------------------------------------------

/**
 * All hash keys
 * @param {String} key
 * @param {function(String[])} callback
 * @see http://redis.io/commands/keys
 */
exports.keys = function(key, callback)
{
	if (/[\?\*\[\]]/.test(key))
	{
		// pattern match against root keys
		redis.keys(key, responder(key, callback, replyType.raw));              // http://redis.io/commands/keys
	}
	else
	{
		// all fields of a hash key
		redis.hkeys(key, responder(key, callback, replyType.raw));             // http://redis.io/commands/hkeys
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
 * @param {string} key
 * @param {string|function(Object)} [p2]
 * @param {function(Object)} [p3]
 */
exports.getObject = function(key, p2, p3) { get(replyType.json, key, p2, p3); };

/**
 * Get key or hash field value as an object
 * @param {Integer} type Reply type
 * @param {string} key
 * @param {string|function(Object)} [p2]
 * @param {function(Object)} [p3]
 */
function get(type, key, p2, p3)
{
	if (p3 === undefined)
	{
		redis.get(schematize(key), responder(key, p2, type));   // http://redis.io/commands/get
	}
	else
	{
		redis.hget(schematize(key), p2, responder(key, p3, type));
	}
}

/**
 * Get all items of a hash
 * @param {String} key
 * @param {function(Object)} callback
 */
exports.getAll = function(key, callback)
{
	redis.hgetall(schematize(key), responder(key, callback, replyType.raw));
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
	key = schematize(key);

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
 * Add value to key or hash field
 * @param {String} key
 * @param {String|Object} p2 Key value or hash field
 * @param {String|Object|function(Boolean)} [p3] Hash field value or callback
 * @param {function(Boolean)} [p4] Callback
 */
exports.add = function(key, p2, p3, p4)
{
	if (p4 !== undefined || (p3 !== undefined && !(p3 instanceof Function)))
	{
		redis.hset(schematize(key), p2, normalize(p3), responder(key, p4, replyType.none));  // http://redis.io/commands/hset
	}
	else if (p3 !== undefined)
	{
		redis.set(schematize(key), normalize(p2), responder(key, p3, replyType.okay));      // http://redis.io/commands/set
	}
	else if (p2 !== undefined)
	{
		redis.set(schematize(key), normalize(p2));
	}
};

/**
 * Add all hash items
 * @param {String} key
 * @param {Object} hash
 * @param {function(Boolean)} [callback]
 */
exports.addAll = function(key, hash, callback)
{
	redis.hmset(schematize(key), hash, responder(key, callback, replyType.okay));           // http://redis.io/commands/hmset
};

// - Responders ---------------------------------------------------------------

/**
 * Closure that returns redis response checker
 * @param {String|String[]} key
 * @param {function(String|String[]|Object|Boolean)} callback
 * @param {Integer} [type] Optionally validate against expected result type
 * @returns {function(Boolean|String|Object)}
 */
function responder(key, callback, type)
{
	return function(err, reply)
	{
		var error = hasError(key, err, type);

		if (callback)
		{
			var response = !error;

			if (!error)
			{
				if (type === undefined) { type = replyType.none; }

				switch (type)
				{
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
 * Schematize key
 * @param {String|String[]} key
 * @return {String|String[]}
 */
function schematize(key)
{
	if (schema != null)
	{
		if (key instanceof Array)
		{
			for (var i = 0; i < key.length; i++)
			{
				key[i] = schema + ':' + key[i];
			}
		}
		else
		{
			key = schema + ':' + key;
		}
		schema = null;
	}
	return key;
}

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
function hasError(key, err, type)
{
	if (err != null)
	{
		if (key instanceof Array) { key = key.toString(); }
		log.error('Operation with key "%s" resulted in %s', key, err.toString());
		return true;
	}
	return false;
}