'use strict';

const TI = require('../');
const LinkDataBase = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Person
 * @see http://schema.org/Person
 */
class LinkDataPerson extends LinkDataBase {
	constructor() {
		super(TI.LinkData.Type.Person);

		this.spouse = null;
		this.born = null;
		this.name = null;

	}
}

module.exports = LinkDataPerson;