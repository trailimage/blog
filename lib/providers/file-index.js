'use strict';

/**
 * @namespace
 * @alias TI.Provider.File
 */
class FileProviderNamespace {
	static get Base() { return require('./file-provider-base.js'); }
	static get Google() { return require('./google/google-file.js'); }
}

module.exports = FileProviderNamespace;