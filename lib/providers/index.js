'use strict';

/**
 * @namespace
 * @name ProviderNamespace
 * @property {LogNamespace} Log
 * @property {FileProviderNamespace} File
 * @property {VideoProviderNamespace} Video
 * @property {CacheNamespace} Cache
 * @property {PhotoProviderNamespace} Photo
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