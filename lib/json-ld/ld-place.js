'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Place
 * @see http://schema.org/Place
 * @see https://en.wikipedia.org/wiki/ISO_3166
 */
class PlaceSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.place; }
		super(type);

		/** @type TI.LinkData.Place */
		this.containedInPlace = null;
		/** @type TI.LinkData.Place */
		this.containsPlace = null;
		/** @type TI.LinkData.Event */
		this.event = null;
		/** @type TI.LinkData.Image|String */
		this.logo = null;
		/** @type TI.LinkData.Image|TI.LinkData.Photograph */
		this.photo = null;
		/** @type String */
		this.telephone = null;
	}
}

module.exports = PlaceSchema;