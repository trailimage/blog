var singleton = {};
var Setting = require('./settings.js');
var log = require('winston');

/**
 * @param {RedisClient} redis
 * @constructor
 */
function Cloud(redis)
{
	/** @type {Cloud} */
	var _this = this;

	/**
	 * @param {String|String[]} keys
	 * @param {function(Boolean)} [callback]
	 * @return {Cloud}
	 */
	this.delete = function(keys, callback)
	{
		redis.del(keys, function(err, reply)
		{
			var expected = (keys instanceof Array) ? keys.length : 1;
			answer(keys, err, reply, callback, expected);
		});
		return _this;
	};

	/**
	 * @param {String} key
	 * @param {function(Object)} callback
	 * @return {Cloud}
	 */
	this.getHash = function(key, callback)
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
		return _this;
	};

	/**
	 * @param {String} key
	 * @param {function(Object)} callback
	 * @return {Cloud}
	 */
	this.getObject = function(key, callback)
	{
		redis.get(key, function(err, reply)
		{
			replyAsObject(key, err, reply, callback);
		});
		return _this;
	};

	/**
	 * @param {String} key
	 * @param {String} field
	 * @param {function(Object)} callback
	 * @return {Cloud}
	 */
	this.getHashObject = function(key, field, callback)
	{
		redis.hget(key, field, function(err, reply)
		{
			replyAsObject(key, err, reply, callback);
		});
		return _this;
	};

	/**
	 * @param {String} key
	 * @param {String} field
	 * @param {function(String)} callback
	 * @return {Cloud}
	 */
	this.getHashItem = function(key, field, callback)
	{
		redis.hget(key, field, function(err, reply)
		{
			callback(reply);
		});
		return _this;
	};

	/**
	 * @param {String} key
	 * @param {Object} err
	 * @param {Object} reply
	 * @param {function(Object)} callback
	 * @return {Cloud}
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

		return _this;
	}

	/**
	 * @param {String} key
	 * @param {Object} object
	 * @param {function(Boolean)} [callback]
	 * @return {Cloud}
	 */
	this.addObject = function(key, object, callback)
	{
		redis.set(key, JSON.stringify(object), function(err, reply)
		{
			answer(key, err, reply, callback, 'OK');
		});

		return _this;
	};

	/**
	 * @param {String} key
	 * @param {String} field
	 * @param {Object} object
	 * @param {function(Boolean)} [callback]
	 * @return {Cloud}
	 */
	this.addHashObject = function(key, field, object, callback)
	{
		return _this.addHashItem(key, field, JSON.stringify(object), callback);
	};

	/**
	 * @param {String} key
	 * @param {String} field
	 * @param {String} value
	 * @param {function(Boolean)} [callback]
	 * @param {String|Number} [expected]
	 * @return {Cloud}
	 */
	this.addHashItem = function(key, field, value, callback, expected)
	{
		redis.hset(key, field, value, function(err, reply)
		{
			answer(key, err, reply, callback, expected);
		});

		return _this;
	};

	/**
	 * @param {String} key
	 * @param {Object} hash
	 * @param {function(Boolean)} [callback]
	 * @return {Cloud}
	 */
	this.addHash = function(key, hash, callback)
	{
		redis.hmset(key, hash, function(err, reply)
		{
			answer(key, err, reply, callback);
		});

		return _this;
	};

	/**
	 * @param {String} key
	 * @param {function(Boolean)} callback
	 * @return {Cloud}
	 */
	this.exists = function(key, callback)
	{
		redis.exists(key, function(err, reply)
		{
			answer(key, err, reply, callback, 1);
		});

		return _this;
	};

	/**
	 * @param {String|String[]} key
	 * @param err
	 * @param {String} reply
	 * @param {function(Boolean)} [callback]
	 * @param {String|Number} [expected] Expected reply
	 */
	function answer(key, err, reply, callback, expected)
	{
		var problem = hasError('save', key, err)
				  || (expected !== undefined && reply != expected);
		if (callback) { callback(!problem); }
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
}

/** @type {Cloud} */
singleton.current = null;

singleton.make = function()
{
	log.info('Constructing redis client');

	/** @type {RedisClient} */
	var redis = require('redis').createClient(Setting.redis.port, Setting.redis.hostname);
	var authorize = function() { redis.auth(Setting.redis.auth); };

	redis.on('error', function(err) { log.error("Could not connect to redis: %s", err.toString()); });
	redis.on('connect', authorize);

	authorize();

	singleton.current = new Cloud(redis);
};

module.exports = singleton;


