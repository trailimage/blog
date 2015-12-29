'use strict';

/**
 * @alias TI.Video
 */
class Video {
	constructor() {
		this.id = null;
		this.width = 0;
		this.height = 0;
	}

	/**
	 * @alias TI.Video.empty
	 * @returns {Boolean}
	 */
	get empty() { return this.width === 0 || this.height === 0; }
}

module.exports = Video;
