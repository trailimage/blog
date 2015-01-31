/**
 * @type {Object}
 */
Winston = {};

/**
 * @type {Object}
 */
Winston.prototype.Log = {};

/**
 *
 * @param {String} message
 * @param {...String} [args]
 */
Winston.Log.prototype.info = function(message, args) {};

/**
 *
 * @param {String} message
 * @param {...String} [args]
 */
Winston.Log.prototype.warn = function(message, args) {};

/**
 *
 * @param {String} message
 * @param {...String} [args]
 */
Winston.Log.prototype.error = function(message, args) {};