'use strict';

const TI = require('../../');
const FactoryBase = TI.Factory.Base;

/**
 * Methods to build models from Flickr API results
 * @alias TI.Factory.Instagram
 * @extends {TI.Factory.Base}
 */
class InstagramFactory extends FactoryBase {
	constructor() {
		super();
	}
}

module.exports = InstagramFactory;