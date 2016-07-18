'use strict';

const { media, Type } = require('./');

// http://schema.org/VideoObject
module.exports = media.extend(Type.video, {
	actor: null,
	director: null,
	caption: null,
	thumbnail: null,
	videoFrameSize: null,
	videoQuality: null,
	musicBy: null
});