'use strict';

/**
 * @namespace TI.Provider.File
 */
class FileProviderNamespace {
	/** @namespace TI.Provider.File.Base */
	static get Base() { return require('./file-base.js'); }
	/** @namespacce TI.Provider.File.Google */
	static get Google() { return require('./google/google-file.js'); }
}

module.exports = FileProviderNamespace;