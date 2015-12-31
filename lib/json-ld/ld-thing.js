'use strict';

/**
 * @alias TI.LinkData.Thing
 * @see http://schema.org/Thing
 */
class ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		this['@context'] = 'http://schema.org';
		/**
		 * Acceptably undefined for Thing
		 * @type String
		 */
		this['@type'] = type;
		/** @type String */
		this['@id'] = null;
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
	get id() { return this['@id']; }
	/** @param {String} value */
	set id(value) { this['@id'] = value; }

	/**
	 * Convert link data to string with nulls and zeroes removed
	 * @alias TI.LinkData.Thing.serialize
	 * @return {String}
	 */
	serialize() {
		return JSON.stringify(this, (key, value) => (value === null || value === 0) ? undefined : value);
	}
}

module.exports = ThingSchema;