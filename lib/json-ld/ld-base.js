'use strict';

/**
 * @alias TI.LinkData.Base
 */
class LinkDataBase {
	constructor(type) {
		this['@context'] = 'http://schema.org';
		this['@type'] = type;
		this['@id'] = null;
	}
}


module.exports = LinkDataBase;