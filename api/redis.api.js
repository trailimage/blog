/**
 * Removes the specified keys. A key is ignored if it does not exist.
 * @param {String|String[]} key
 * @param {function(number)} [callback] Number of keys removed
 * @see http://redis.io/commands/del
 */
redis.prototype.del = function(key, callback) {};

/**
 * Removes the specified fields from the hash stored at key. Specified fields that
 * do not exist within this hash are ignored. If key does not exist, it is treated
 * as an empty hash and this command returns 0.
 * @param {String} key
 * @param {String|String[]} hashKey
 * @param {function(number)} [callback] Number of keys removed
 * @see http://redis.io/commands/hdel
 */
redis.prototype.hdel = function(key, hashKey, callback) {};

/**
 * @param {String} key
 * @param {function(number)} callback Existence indicated by 1 or 0
 * @see http://redis.io/commands/exists
 */
redis.prototype.exists = function(key, callback) {};

/**
 * Returns if field is an existing field in the hash stored at key
 * @param {String} key
 * @param {String} hashKey
 * @param {function(number)} callback Existence indicated by 1 or 0
 * @see http://redis.io/commands/hexists
 */
redis.prototype.hexists = function(key, hashKey, callback) {};

/**
 * Returns all keys matching pattern
 * @param {String} pattern
 * @param {function(String[])} callback
 * @see http://redis.io/commands/keys
 */
redis.prototype.keys = function(pattern, callback) {};

/**
 * Returns all hash keys matching pattern
 * @param {String} pattern
 * @param {function(String)} callback
 * @see http://redis.io/commands/hkeys
 */
redis.prototype.hkeys = function(pattern, callback) {};

/**
 * Returns the value associated with the key
 * @param {String} key
 * @param {function(String)} callback
 * @see http://redis.io/commands/get
 */
redis.prototype.get = function(key, callback) {};

/**
 * Returns the value associated with field in the hash stored at key
 * @param {String} key
 * @param {String} hashKey
 * @param {function(String)} callback
 * @see http://redis.io/commands/hget
 */
redis.prototype.hget = function(key, hashKey, callback) {};

/**
 * Returns all fields and values of the hash stored at key
 * @param {String} key
 * @param {function(Object)} callback Name-value pairs
 * @see http://redis.io/commands/hgetall
 * @see https://github.com/mranney/node_redis#clienthgetallhash
 */
redis.prototype.hgetall = function(key, callback) {};

/**
 * Set key to hold the string value. If key already holds a value, it is overwritten,
 * regardless of its type.
 * @param {String} key
 * @param {String} value
 * @see http://redis.io/commands/set
 */
redis.prototype.set = function(key, value) {};

/**
 * Sets field in the hash stored at key to value. If key does not exist, a new key holding
 * a hash is created. If field already exists in the hash, it is overwritten.
 * @param {String} key
 * @param {String} hashKey
 * @param {String} value
 * @param {function(Boolean|String|Object)} [callback]
 * @see http://redis.io/commands/hset
 */
redis.prototype.hset = function(key, hashKey, value, callback) {};

/**
 * Sets the specified fields to their respective values in the hash stored at key.
 * This command overwrites any existing fields in the hash. If key does not exist,
 * a new key holding a hash is created.
 * @param {String} key
 * @param {Object} hash Name-value pairs
 * @see http://redis.io/commands/hset
 * @see https://github.com/mranney/node_redis#clienthmsethash-obj-callback
 */
redis.prototype.hmset = function(key, hash, value) {};