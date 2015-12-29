'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Event
 * @see http://schema.org/Event
 */
class EventSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.event; }

		super(type);

		/** @type TI.LinkData.Organization|TI.LinkData.Person */
		this.attendee = null;
		/** @type TI.LinkData.Duration */
		this.duration = null;
		/** @type TI.LinkData.Place|String */
		this.location = null;
		/** @type TI.LinkData.Organization|TI.LinkData.Person */
		this.organizer = null;
		/** @type TI.LinkData.Review */
		this.review = null;
		/** @type TI.LinkData.CreativeWork */
		this.workFeatured = null;
		/** @type TI.LinkData.CreativeWork */
		this.workPerformed = null;
	}
}

module.exports = EventSchema;