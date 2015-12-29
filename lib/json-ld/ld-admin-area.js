'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.AdminArea
 * @see http://schema.org/AdministrativeArea
 */
class AdminAreaSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.administrativeArea; }

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
		/** @type TI.LinkData.Review */
		this.review = null;
		/** @type String */
		this.telephone = null;
		/** @type TI.LinkData.AggregateRating */
		this.aggregateRating = null;
		/** @type TI.LinkData.Shape|TI.LinkData.Coordinates */
		this.geo = null;
	}
}

module.exports = AdminAreaSchema;