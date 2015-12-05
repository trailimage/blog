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
 * Last time milliseconds black list was downloaded
 * @type {Number}
 */
let lastUpdate = 0;
let blackList = [];
/** @type {function[]} */
let pending = [];
let isDownloading = false;

module.exports.filter = function(req, res, next) {
	let referer = req.get('referer');

	if (is.value(referer)) {
		isSpam(format.topDomain(referer), yes => {
			if (yes) {
				db.log.warn('Spam blocked %s referer', referer);
				res.status(Enum.httpStatus.notFound).end();
			} else {
				next();
			}
		});
	} else {
		next();
	}
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
		if (isStale()) { downloadBlackList(); }
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
			if (isStale()) { downloadBlackList(); }
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
	return lastUpdate === 0 || (lastUpdate - new Date().getTime() > config.referalSpam.updateFrequency);
}

/**
 * @param {function(String[])} [callback]
 */
function downloadBlackList(callback) {
	if (isDownloading) {
		if (is.callable(callback)) {
			db.log.info('Spam referal black list is already downloading');
			pending.push(callback);
		}
	} else {
		isDownloading = true;
		db.log.info('Downloading spam referal black list');

		request(config.referalSpam.listUrl, (error, response, body) => {
			/** @type {String[]} */
			let list = null;

			if (error !== null) {
				db.log.error('Failed to download referer blacklist: %s', error.toString());
			} else if (response.statusCode != 200) {
				db.log.error('%s returned status %s', config.referalSpam.listUrl, response.statusCode);
			} else {
				// list of non-empty lines
				list = blackList = body.split('\n').filter(i => !is.empty(i));
				lastUpdate = new Date().getTime();
				db.log.info('Downloaded %d blocked domains', list.length);
				db.cache.add(cacheKey, list);
			}

			if (is.array(list)) {
				if (is.callable(callback)) { callback(list); }
				// execute pending callbacks
				for (c of pending) { c(list); }
				pending = [];
			}
			isDownloading = false;
		});
	}
}