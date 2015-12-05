'use strict';

const is = require('../is.js');
const format = require('../format.js');
const Enum = require('../enum.js');
const request = require('request');
const fs = require('fs');
const config = require('../config.js');
const db = config.provider;
const cacheKey = 'spam-referer';
/**
 * Last time black list was downloaded
 * @type {Date}
 */
let lastUpdate = null;
let blackList = [];

module.exports.filter = function(req, res, next) {
	let referer = req.get('referer');

	if (is.value(referer)) {
		isSpam(format.topDomain(referer), yes => {
			if (yes) {
				db.log.warn('Spam blocked %s referer', referer);
				res.status(Enum.httpStatus.notFound).end();
			}
		});
	}
	next();
};

/**
 * @param {String} domain
 * @param {function(Boolean)} callback
 */
function isSpam(domain, callback) {
	if (blackList.length === 0) {
		loadBlackList(list => {
			blackList = list;
			callback(blackList.indexOf(domain) !== -1);
		});
	} else {
		callback(blackList.indexOf(domain) !== -1);
	}
}

/**
 * Load list from cache or remote provider
 * @param {function(String[])} callback
 */
function loadBlackList(callback) {
	db.cache.getObject(cacheKey, value => {
		if (is.array(value)) {
			callback(value);

			if (isStale()) {
				downloadBlackList(list => {
					db.cache.add(cacheKey, list);
				});
			}
		} else {
			downloadBlackList(callback);
		}
	});
}

/**
 * Whether black list needs to be refreshed
 * @returns {Boolean}
 */
function isStale() {
	return lastUpdate === null || (lastUpdate.getTime() - new Date().getTime() > config.referalSpam.updateFrequency);
}

/**
 *
 * @param callback
 */
function downloadBlackList(callback) {
	request(config.referalSpam.listUrl, (error, response, body) => {
		if (error === null && response.statusCode == 200) {
			// list of non-empty lines
			callback(body.split('\n').filter(i => !is.empty(i)));
		}
	});
}