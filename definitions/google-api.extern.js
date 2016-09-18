GoogleAPI = {};

/** @type {GoogleAuth} */
GoogleAPI.prototype.auth = null;


GoogleAuth = {};

/** @type {OAuth2Client} */
GoogleAuth.prototype.OAuth2 = null;

OAuth2Client = {};

/**
 * @param {Object} credentials
 */
OAuth2Client.prototype.setCredentials = function(credentials) {};

/**
 *
 * @param opt_opts
 */
OAuth2Client.prototype.generateAuthUrl = function(opt_opts) {};

/**
 * Retrieves the access token using refresh token
 *
 * @deprecated use getRequestMetadata instead.
 * @param {function} callback callback
 */
OAuth2Client.prototype.refreshAccessToken = function(callback) {};