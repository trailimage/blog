'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.CreativeWork
 * @see http://schema.org/CreativeWork
 */

class CreativeWorkSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.creativeWork; }

		super(type);

		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.author = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.creator = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.provider = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.producer = null;
		/** @type TI.LinkData.Organization */
		this.sourceOrganization = null;
		/** @type TI.LinkData.Person */
		this.editor = null;
		/** @type TI.LinkData.NewsArticle */
		this.associatedArticle = null;
		/** @type ?Boolean */
		this.requiresSubscription = null;
		/** @type String */
		this.contentSize = null;
		/** @type String */
		this.contentUrl = null;
		/** @type String */
		this.encodingFormat = null;
		/** @type String */
		this.bitrate = null;
		/** @type TI.LinkData.Duration */
		this.duration = null;
		/** @type Number */
		this.height = 0;
		/** @type Number */
		this.width = 0;
		/** @type TI.LinkData.Organization */
		this.productionCompany = null;
		/** @type TI.LinkData.Place */
		this.regionsAllowed = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.copyrightHolder = null;
		/** @type Number */
		this.copyrightYear = 0;
		/** @type TI.LinkData.Audience */
		this.audience = null;
		/** @type TI.LinkData.Media */
		this.encoding = null;
		/** @type TI.LinkData.CreativeWork */
		this.hasPart = null;
		/** @type TI.LinkData.CreativeWork */
		this.isPartOf = null;
		/** @type String */
		this.headline = null;
		/**
		 * Comma-delimited
		 * @type String
		 */
		this.keywords = null;
		/** @type TI.LinkData.Place */
		this.locationCreated = null;
		/** @type TI.LinkData.Review */
		this.review = null;
		/**
		 * @type Date
		 * @see http://en.wikipedia.org/wiki/ISO_8601
		 */
		this.datePublished = null;
		/** @type String */
		this.text = null;
		/** @type Number */
		this.version = 0;
		/**
		 * primary entity described in some page or other CreativeWork
		 * @type TI.LinkData.Base
		 */
		this.mainEntity = null;
	}
}


module.exports = CreativeWorkSchema;