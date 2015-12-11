'use strict';

/**
 * @namespace TI.Provider
 */
class ProviderNamespace {}

/** @type {TI.Provider.File} */
ProviderNamespace.File = require('./file-index.js');
/** @type {TI.Provider.Video} */
ProviderNamespace.Video = require('./video-index.js');
/** @type {TI.Provider.Log} */
ProviderNamespace.Log = require('../log');
/** @type {TI.Provider.Cache} */
ProviderNamespace.Cache = require('../cache');
/** @type {TI.Provider.Photo} */
ProviderNamespace.Photo = require('./photo-index.js');

module.exports = ProviderNamespace;