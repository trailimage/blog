'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.WebPage
 * @see http://schema.org/WebPage
 */

class WebPageSchema extends CreativeWorkSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.webPage; }
		super(type);

		/** @type String */
		this.significantLink = null;
		/** @type TI.LinkData.Image */
		this.primaryImageOfPage = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.reviewdBy = null;
		/** @type String|String[] */
		this.relatedLink = null;
		/**
		 * @type String
		 * @see http://schema.org/Specialty
		 */
		this.specialty = null;
		/** @type String|TI.LinkData.List */
		this.breadcrumb = null;
		/** @type TI.LinkData.CreativeWork */
		this.mainContentOfPage = null;
	}
}


module.exports = WebPageSchema;