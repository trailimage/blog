'use strict';

/**
 * @namespace TI.Provider
 */
class ProviderNamespace {}

/** @type {FileProviderNamespace} */
ProviderNamespace.File = require('./file-index.js');
/** @type {VideoProviderNamespace} */
ProviderNamespace.Video = require('./video-index.js');
/** @type {LogNamespace} */
ProviderNamespace.Log = require('../log');
/** @type {CacheNamespace} */
ProviderNamespace.Cache = require('../cache');
/** @type {PhotoProviderNamespace} */
ProviderNamespace.Photo = require('./photo-index.js');

module.exports = ProviderNamespace;