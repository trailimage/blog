'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Person
 * @see http://schema.org/Person
 */
class PersonSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.person; }
		super(type);

		/** @type String */
		this.name = null;
		/** @type TI.LinkData.Organization */
		this.affiliation = null;
		/** @type String */
		this.email = null;
		/** @type TI.LinkData.Person */
		this.follows = null;
		/** @type String */
		this.gender = null;
		/** @type String */
		this.givenName = null;
		/** @type String */
		this.familyName = null;
		/** @type String */
		this.jobTitle = null;
		/** @type TI.LinkData.Organization */
		this.worksFor = null;
		/** @type TI.LinkData.Ownership|TI.LinkData.Product */
		this.owns = null;
		/** @type TI.LinkData.Person */
		this.parent = null;
		/** @type TI.LinkData.Person */
		this.children = null;
		/** @type TI.LinkData.Person */
		this.spouse = null;
		/** @type TI.LinkData.Place */
		this.birthPlace = null;
		/** @type String */
		this.honorificPrefix = null;
		/** @type String */
		this.honorificSuffix = null;
		/** @type String[] */
		this.sameAs = null;
	}
}

module.exports = PersonSchema;