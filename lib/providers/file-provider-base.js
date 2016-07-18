'use strict';

const TI = require('../');
const db = TI.active;
const config = TI.config;
const OAuthBase = TI.Auth.Base;
const FeatureCollection = TI.Map.FeatureList;

/**
 * Manage stored files
 * @extends TI.Auth.Base
 */
class FileProviderBase extends OAuthBase {
	constructor() {
		super();

		this.options = {};
		this._needsAuth = false;
	}

	/**
	 * @returns {Boolean}
	 */
	get needsAuth() { return this._needsAuth; }

	/**
	 * @param {Boolean} needs
	 */
	set needsAuth(needs) { this._needsAuth = needs; }







module.exports = FileProviderBase;

// - Private static members ---------------------------------------------------

/**
 * Cache key that contains field keys for each cached GPX
 * @type String
 */
const key = 'map';