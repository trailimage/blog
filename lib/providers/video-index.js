'use strict';

class VideoProviderNamespace {
	static get Base() { return require('./video-base.js'); }
	static get Google() { return require('./google/google-video.js'); }
}

module.exports = VideoProviderNamespace;
