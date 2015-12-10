'use strict';

/**
 * @namespace
 */
class FileProviderNamespace {
	static get Base() { return require('./file-base.js'); }
	static get Google() { return require('./google/google-file.js'); }
}

module.exports = FileProviderNamespace;