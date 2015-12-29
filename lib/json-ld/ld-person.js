'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Person
 * @see http://schema.org/Person
 */
class PersonSchema extends BaseSchema {
	constructor() {
		super(TI.LinkData.Type.person);

		this.spouse = null;
		this.born = null;
		this.name = null;

	}
}

module.exports = PersonSchema;