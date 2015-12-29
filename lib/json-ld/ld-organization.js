'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Organization
 * @see http://schema.org/Organization
 */

class OrganizationSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.organization; }

		super(type);
		/** @type String|TI.LinkData.Image */
		this.logo = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.member = null;
		/** @type TI.LinkData.Review */
		this.review = null;
		/** @type String */
		this.email = null;
		/** @type String */
		this.telephone = null;
		/** @type Number */
		this.numberOfEmployees = 0;
		/** @type TI.LinkData.Ownership|TI.LinkData.Product */
		this.owns = null;
		/** @type TI.LinkData.Demand */
		this.seeks = null;
	}
}


module.exports = OrganizationSchema;