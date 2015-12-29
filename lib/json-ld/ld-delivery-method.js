'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.DeliveryMethod
 * @see http://schema.org/DeliveryMethod
 */
class DeliveryMethodSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.deliveryMethod; }
		super(type);
	}
}

DeliveryMethodSchema.DirectDownload = 'http://purl.org/goodrelations/v1#DeliveryModeDirectDownload';
DeliveryMethodSchema.Freight = 'http://purl.org/goodrelations/v1#DeliveryModeFreight ';
DeliveryMethodSchema.Mail = 'http://purl.org/goodrelations/v1#DeliveryModeMail';
DeliveryMethodSchema.OwnFleet = 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet';
DeliveryMethodSchema.PickUp = 'http://purl.org/goodrelations/v1#DeliveryModePickUp';
DeliveryMethodSchema.DHL = 'http://purl.org/goodrelations/v1#DHL';
DeliveryMethodSchema.FederalExpress = 'http://purl.org/goodrelations/v1#FederalExpress';
DeliveryMethodSchema.UPS = 'http://purl.org/goodrelations/v1#UPS';

module.exports = DeliveryMethodSchema;