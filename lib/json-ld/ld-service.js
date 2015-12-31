'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Service
 * @see http://schema.org/Service
 */
class ServiceSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.demand; }
		super(type);

		/** @type String */
		this.serviceType = null;
		/** @type TI.LinkData.AggregateRating */
		this.aggregateRating = null;
		/** @type TI.LinkData.Place|TI.LinkData.Shape|TI.LinkData.AdminArea|String */
		this.areaServed = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.provider = null;
		/** @type TI.LinkData.Review */
		this.review = null;
	}
}

module.exports = ServiceSchema;