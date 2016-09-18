/**
 @template T
 @class Set
 @param {Array.<T>} [iterable]
 */
Set = function(iterable) {};

/**
 * Returns the number of values in the Set object
 * @type {Number}
 */
Set.prototype.size;

/**
 * Appends a new element with the given value to the Set object. Returns the Set object.
 * @param {T} value
 * @return {Set}
 */
Set.prototype.add = function(value) {};

/**
 * Removes all elements from the Set object
 */
Set.prototype.clear = function() {};

/**
 * Removes the element associated to the value and returns the value that Set.prototype.has(value)
 * would have previously returned. Set.prototype.has(value) will return false afterwards.
 */
Set.prototype.delete = function(value) {};

/**
 * Returns a new Iterator object that contains an array of [value, value] for each element
 * in the Set object, in insertion order. This is kept similar to the Map object, so that
 * each entry has the same value for its key and value here.
 * @return {Array.<Array<T>>}
 */
Set.prototype.entries = function() {};

/**
 * Calls callback once for each value present in the Set object, in insertion order.
 * If a context parameter is provided to forEach, it will be used as the this value for each callback.
 * @param {function(T)} callback
 * @param {this:object} [context]
 */
Set.prototype.foreach = function(callback, context) {};

/**
 * Returns a boolean asserting whether an element is present with the given value in the Set object or not
 * @param {T} value
 * @return {Boolean}
 */
Set.prototype.has = function(value) {};

/**
 * Returns a new Iterator object that contains the values for each element in the Set object in insertion order
 * @return {Array.<T>}
 */
Set.prototype.values = function() {};

/**
 * Is the same function as the values() function and returns a new Iterator object that contains the
 * values for each element in the Set object in insertion order
 * @return {Array.<T>}
 */
Set.prototype.keys = function() {};


/**
 @template K,V
 @class Map
 @param {Array.<Array<K|V>>} [iterable]
 @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 @see http://stackoverflow.com/questions/16017627/document-generic-type-parameters-in-jsdoc
 */
Map = function(iterable) {};

/**
 * Returns the number of key/value pairs in the Map object
 * @type {Number}
 */
Map.prototype.size;

/**
 * Removes all key/value pairs from the Map object
 */
Map.prototype.clear = function() {};

/**
 * Removes any value associated to the key and returns the value that Map.prototype.has(value)
 * would have previously returned. Map.prototype.has(key) will return false afterwards.
 * @param {K} key
 */
Map.prototype.delete = function(key) {};

/**
 * Returns returns a new Iterator object that contains an array of [key, value]
 * for each element in the Map object in insertion order
 * @return {Array.<Array<T>>}
 */
Map.prototype.entries = function() {};

/**
 * Calls callback once for each key-value pair present in the Map object, in insertion order.
 * If a context parameter is provided to forEach, it will be used as the this value for each callback
 * @param {function(K, V)} callback
 * @param {this:object} [context]
 */
Map.prototype.foreach = function(callback, context) {};

/**
 * Returns the value associated to the key, or undefined if there is none
 * @param {K} key
 * @return {*}
 */
Map.prototype.get = function(key) {};

/**
 * Returns a boolean asserting whether a value has been associated to the key in the Map object or not
 * @param {K} key
 * @return {Boolean}
 */
Map.prototype.has = function(key) {};

/**
 * Sets the value for the key in the Map object. Returns the Map object.
 * @param {K} key
 * @param {V} value
 * @return {Map}
 */
Map.prototype.set = function(key, value) {};

/**
 * Returns a new Iterator object that contains the values for each element in the Map object in insertion order
 * @return {Array.<V>}
 */
Map.prototype.values = function() {};

/**
 * Returns a new Iterator object that contains the keys for each element in the Map object in insertion order
 * @return {Array.<K>}
 */
Map.prototype.keys = function() {};

