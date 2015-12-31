'use strict';

const contextField = '@context';
const typeField = '@type';
const idField = '@id';

/**
 * @alias TI.LinkData.Thing
 * @see http://schema.org/Thing
 */
class ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		this[contextField] = 'http://schema.org';
		/**
		 * Acceptably undefined for Thing
		 * @type String
		 */
		this[typeField] = type;
		/** @type String */
		this[idField] = null;
		/** @type String */
		this.name = null;
		/** @type String */
		this.description = null;
		/** @type String|TI.LinkData.Image */
		this.image = null;
		/** @type String */
		this.alternateName = null;
		/** @type String */
		this.additionalType = null;
		/** @type TI.LinkData.Action */
		this.potentialAction = null;
		/** @type String */
		this.url = null;
		/**
		 * Indicates a page (or other CreativeWork) for which this thing is the main entity being described
		 * @type String|TI.LinkData.CreativeWork
		 */
		this.mainEntityOfPage = null;
	}

	/** @return {String} */
	get id() { return this[idField]; }
	/** @param {String} value */
	set id(value) { this[idField] = value; }

	/** @return {String} */
	get context() { return this[contextField]; }
	/** @param {String} value */
	set context(value) { this[contextField] = value; }

	/**
	 * Convert link data to string with nulls and zeroes removed
	 * @alias TI.LinkData.Thing.serialize
	 * @return {String}
	 */
	serialize() {
		removeContext(this, null);
		return JSON.stringify(this, (key, value) => (value === null || value === 0) ? undefined : value);
	}
}

/**
 * Remove redundant context specifications
 * @param {Object} o
 * @param {String} context Current schema context
 */
function removeContext(o, context) {
	if (o !== undefined && o !== null && typeof(o) == 'object') {
		if (o.hasOwnProperty(contextField) && o[contextField] !== null) {
			if (o[contextField] == context) {
				// remove redundant value
				delete o[contextField];
			} else {
				// switch to new context
				context = o[contextField];
			}
		}
		for (let field in o) { removeContext(o[field], context); }
	}
}

module.exports = ThingSchema;