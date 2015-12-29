'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Action
 * @see http://schema.org/Action
 */
class ActionSchema extends BaseSchema {
	/**
	 * @param {String} type
	 */
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.action; }

		super(type);

		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.agent = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.participant = null;
		/** @type TI.LinkData.DateTime */
		this.startTime = null;
		/** @type TI.LinkData.DateTime */
		this.endTime = null;
		/** @type String|TI.LinkData.EntryPoint */
		this.target = null;
	}
}

module.exports = ActionSchema;