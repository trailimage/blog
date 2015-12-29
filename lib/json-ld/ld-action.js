'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Action
 * @see http://schema.org/Action
 */
class ActionSchema extends BaseSchema {
	constructor() {
		super(TI.LinkData.Type.action);

		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.agent = null;
		/** @type TI.LinkData.Person|TI.LinkData.Organization */
		this.participant = null;
		/** @type TI.LinkData.DateTime */
		this.startTime = null;
		/** @type TI.LinkData.DateTime */
		this.endTime = null;
	}
}

module.exports = ActionSchema;