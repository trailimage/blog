'use strict';

class ProviderNamespace {}

ProviderNamespace.File = require('./file-index.js');
ProviderNamespace.Video = require('./video-index.js');
ProviderNamespace.Log = require('../log');
ProviderNamespace.Cache = require('../cache');
ProviderNamespace.Photo = require('./photo-index.js');

module.exports = ProviderNamespace;