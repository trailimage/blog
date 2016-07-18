'use strict';

const { thing, Type } = require('./');

// http://schema.org/Demand
module.exports =thing.extend(Type.demand, {
	sku: null,
	serialNumber: null,
	seller: null,
	availabiltyStarts: null,
	availabilityEnds: null,
	availableDeliveryMethod: null,
	eligibleQuantity: 0,
	validFrom: null,
	validThrough: null,
	itemOffered: null,
	inventoryLevel: 0
});