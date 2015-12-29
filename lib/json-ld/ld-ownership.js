'use strict';

const TI = require('../');
const ThingSchema = TI.LinkData.Thing;

/**
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Ownership
 * @see http://schema.org/OwnershipInfo
 */
class OwnershipSchema extends ThingSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.ownership; }
		super(type);

		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.acquiredFrom = null;
		/** @type TI.LinkData.DateTime */
		this.ownedFrom = null;
		/** @type TI.LinkData.DateTime */
		this.ownedThrough = null;
		/** @type TI.LinkData.Product */
		this.typeOfGood = null;
	}
}

module.exports = OwnershipSchema;