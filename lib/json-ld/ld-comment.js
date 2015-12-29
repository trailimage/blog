'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Comment
 * @see http://schema.org/Comment
 */

class CommentSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.comment; }

		super(type);

		/** @type Number */
		this.downvoteCount = 0;
		/** @type Number */
		this.upvoteCount = 0;
	}
}


module.exports = CommentSchema;