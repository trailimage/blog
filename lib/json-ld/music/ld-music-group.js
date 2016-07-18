'use strict';

const { organization, Music } = require('../');

// http://schema.org/MusicGroup
module.exports = organization.extend(Music.Type.group, {
	actor: null,
	director: null,
	caption: null,
	thumbnail: null,
	videoFrameSize: null,
	videoQuality: null
});