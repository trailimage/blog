'use strict';

/**
 * @alias TI.LinkData.Base
 */
class BaseSchema {
	constructor(type) {
		this['@context'] = 'http://schema.org';
		/** @type String */
		this['@type'] = type;
		/** @type String */
		this['@id'] = null;
		/** @type String */
		this.name = null;
		/** @type String|TI.LinkData.Image */
		this.image = null;
		/** @type String */
		this.alternateName = null;
		/** @type String */
		this.additionalType = null;
		/** @type TI.LinkData.Action */
		this.potentialAction = null;
		/** @type String */
		this.url = null;
		/**
		 * Indicates a page (or other CreativeWork) for which this thing is the main entity being described
		 * @type String|TI.LinkData.CreativeWork
		 */
		this.mainEntityOfPage = null;
	}
}


module.exports = BaseSchema;