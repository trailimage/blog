'use strict';

/** @type {ProviderManager} */
let _provider = null;
const _enum = require('./enum.js');

class TrailImageIndex {
	static get is() { return require('./is.js'); }
	static get re() { return require('./regex.js'); }
	static get template() { return require('./template.js'); }
	static get format() { return require('./format.js'); }
	static get config() { return require('./config.js'); }

	/**
	 * @returns {LogBase}
	 */
	static get log() { return TrailImageIndex.provider.log; }

	/**
	 * @returns {CacheHelper}
	 */
	static get cache() { return TrailImageIndex.provider.cache; }

	/**
	 * Dependency injected providers
	 * @returns {ProviderManager}
	 */
	static get provider() {
		if (_provider === null) {
			const ProviderManager = require('./providers/manager.js');
			_provider = new ProviderManager();
		}
		return _provider;
	}

	/**
	 * @returns {MapIndex}
	 * @constructor
	 */
	static get Map() { return require('./map'); }

	/**
	 * @returns {AuthIndex}
	 * @constructor
	 */
	static get Auth() { return require('./auth'); }

	/**
	 * @returns {LogIndex}
	 * @constructor
	 */
	static get Log() { return require('./log'); }

	/**
	 * @returns {CacheIndex}
	 * @constructor
	 */
	static get Cache() { return require('./cache'); }

	/**
	 * @returns {FactoryIndex}
	 * @constructor
	 */
	static get Factory() { return require('./models'); }

	/**
	 * @returns {MiddlewareIndex}
	 * @constructor
	 */
	static get Middleware() { return require('./middleware'); }

	/**
	 * @returns {ControllerIndex}
	 * @constructor
	 */
	static get Controller() { return require('./controllers'); }

	/**
	 * @returns {EXIF}
	 * @constructor
	 */
	static get EXIF() { return require('./models/exif.js'); }

	/**
	 * @returns {Library}
	 * @constructor
	 */
	static get Library() { return require('./models/library.js'); }

	/**
	 * @returns {Post}
	 * @constructor
	 */
	static get Post() { return require('./models/post.js'); }

	/**
	 * @returns {PostTag}
	 * @constructor
	 */
	static get PostTag() { return require('./models/post-tag.js'); }

	/**
	 * @returns {Photo}
	 * @constructor
	 */
	static get Photo() { return require('./models/photo.js'); }

	/**
	 * @returns {Size}
	 * @constructor
	 */
	static get PhotoSize() { return require('./models/size.js'); }

	/**
	 * @returns {Video}
	 * @constructor
	 */
	static get Video() { return require('./models/video.js'); }
}

TrailImageIndex.enum = _enum;
TrailImageIndex.icon = _enum.icon;
TrailImageIndex.httpStatus = _enum.httpStatus;
TrailImageIndex.mimeType = _enum.mimeType;

module.exports = TrailImageIndex;