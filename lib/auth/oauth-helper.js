'use strict';

const TI = require('../');
const OAuth = require('oauth').OAuth;
const request = require('request');
const is = TI.is;
const URL = require('url');
const querystring = require('querystring');

module.exports = OAuth;

/**
 * Override node-oauth methods to support proxied requests
 * @param {String} token
 * @param {String} secret
 * @param {String} method
 * @param url
 * @param parameters
 * @param {String} body
 * @param {String} contentType
 * @param {function} callback
 * @private
 * @see https://github.com/ciaranj/node-oauth
 */
OAuth.prototype._performSecureRequest = function(token, secret, method, url, parameters, body, contentType, callback) {
	let orderedParameters = this._prepareParameters(token, secret, method, url, parameters);
	let parsedUrl = parseUrl(url);
	let path = parsedUrl.pathname + (is.empty(parsedUrl.query) ? '' : '?' + parsedUrl.query);
	let headers = buildHeaders.call(this, parsedUrl.host, orderedParameters, contentType);

	parameters = normalizeParameters.call(this, parameters);
	body = normalizeBody(body, method, parameters);

	if (is.empty(body)) {
		headers["Content-length"] = 0;
	} else {
		headers["Content-length"] = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body);
	}

	let options = {
		url: parsedUrl.protocol + '//' + parsedUrl.hostname + path.replace('//', '/'),
		headers: headers
	};
	if (!is.empty(TI.config.proxy)) { options.proxy = TI.config.proxy; }

	request(options, (error, response, data) => {
		let status = response.statusCode;
		if (is.callable(callback)) {
			if (status >= 200 && status <= 299) {
				callback(null, data, response);
			} else {
				// Follow 301 or 302 redirects with Location HTTP header
				if ((status == 301 || status == 302) &&
					this._clientOptions.followRedirects && response.headers && response.headers.location) {
					this._performSecureRequest(token, secret, method, response.headers.location, parameters, body, contentType, callback);
				}
				else {
					callback({ statusCode: status, data: data }, data, response);
				}
			}
		} else {
			// not explicitly supported by this override
			//callback({ statusCode: status, data: data }, data, response);
		}
	});
};

// - Private members ----------------------------------------------------------

function buildHeaders(host, parameters, contentType) {
	let headers = {};
	let authorization = this._buildAuthorizationHeaders(parameters);
	let authHeader = this._isEcho ? "X-Verify-Credentials-Authorization" : "Authorization";

	if (is.empty(contentType)) { contentType= "application/x-www-form-urlencoded"; }

	for (var key in this._headers) {
		if (is.defined(this._headers, key)) { headers[key] = this._headers[key]; }
	}

	headers[authHeader] = authorization;
	headers["Host"] = host;
	headers["Content-Type"]= contentType;

	return headers;
}

/**
 * @param {String} url
 * @return {Url}
 */
function parseUrl(url) {
	let parsedUrl = URL.parse(url, false);
	if (parsedUrl.protocol == "http:" && !parsedUrl.port) { parsedUrl.port = 80; }
	if (parsedUrl.protocol == "https:" && !parsedUrl.port) { parsedUrl.port = 443; }
	if (is.empty(parsedUrl.pathname)) { parsedUrl.pathname = "/"; }
	return parsedUrl;
}

/**
 * @param {Object.<String>} parameters
 * @return {Object.<String>}
 */
function normalizeParameters(parameters) {
	// Filter out any passed extra_params that are really to do with OAuth
	for (var key in parameters) {
		if (this._isParameterNameAnOAuthParameter(key)) { delete parameters[key]; }
	}
	return parameters;
}

/**
 * @param {String} body
 * @param {String} method
 * @param {Object.<String>} parameters
 * @return string
 */
function normalizeBody(body, method, parameters) {
	if ((method == "POST" || method == "PUT") && (body === null && is.value(parameters))) {
		// Fix the mismatch between the output of querystring.stringify() and this._encodeData()
		return querystring.stringify(parameters)
			.replace(/!/g, "%21")
			.replace(/'/g, "%27")
			.replace(/\(/g, "%28")
			.replace(/\)/g, "%29")
			.replace(/\*/g, "%2A");
	} else {
		return body;
	}
}
