'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Demand
 * @see http://schema.org/Demand
 */
class DemandSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.demand; }
		super(type);

		/** @type String */
		this.sku = null;
		/** @type String */
		this.serialNumber = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.seller = null;
		/** @type TI.LinkData.DateTime */
		this.availabiltyStarts = null;
		/** @type TI.LinkData.DateTime */
		this.availabilityEnds = null;
		/** @type TI.LinkData.DeliveryMethod */
		this.availableDeliveryMethod = null;
		/** @type Number */
		this.eligibleQuantity = 0;
		/** @type TI.LinkData.DateTime */
		this.validFrom = null;
		/** @type TI.LinkData.DateTime */
		this.validThrough = null;
		/** @type TI.LinkData.Product|TI.LinkData.Service */
		this.itemOffered = null;
		/** @type Number */
		this.inventoryLevel = 0;
	}
}

module.exports = DemandSchema;