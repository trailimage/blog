'use strict';

const { thing, Type } = require('./');

// http://schema.org/DeliveryMethod
module.exports = thing.extend(Type.deliveryMethod, {
	method: {
		directDownload: 'http://purl.org/goodrelations/v1#DeliveryModeDirectDownload',
		freight: 'http://purl.org/goodrelations/v1#DeliveryModeFreight ',
		mail: 'http://purl.org/goodrelations/v1#DeliveryModeMail',
		ownFleet: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
		pickUp: 'http://purl.org/goodrelations/v1#DeliveryModePickUp',
		DHL: 'http://purl.org/goodrelations/v1#DHL',
		federalExpress: 'http://purl.org/goodrelations/v1#FederalExpress',
		UPS: 'http://purl.org/goodrelations/v1#UPS'
	}
});