'use strict';

const is = require('../is');
const log = require('../logger');
const config = require('../config');
const format = require('../format');
const cache = require('../cache');
const C = require('../constants');
const fetch = require('node-fetch');
const fs = require('fs');
const cacheKey = 'spam-referer';
/**
 * Last time in milliseconds that black list was downloaded
 * @type Number
 */
let lastUpdate = 0;
let blackList = [];
/**
 * Pending black list lookup callbacks
 * @type {function[]}
 */
let pending = [];
let isDownloading = false;

module.exports = {
   filter: function(req, res, next) {
      let referer = req.get('referer');

      if (is.value(referer)) {
         checkBlackList(format.topDomain(referer)).then(yes => {
            if (yes) {
               log.warnIcon(C.icon.target, 'Spam blocked %s referer', referer);
               res.status(C.httpStatus.NOT_FOUND).end();
            } else {
               next();
            }
         });
      } else {
         next();
      }
   },
   cacheKey
};

/**
 * @param {string} domain
 * @returns {Promise}
 */
function checkBlackList(domain) {
   if (blackList.length === 0) {
      return getBlackList().then(list => {
         blackList = list;
         return blackList.indexOf(domain) !== -1;
      });
   } else {
      if (isStale()) { downloadBlackList(); }
      return Promise.resolve(blackList.indexOf(domain) !== -1);
   }
}

/**
 * Load list from cache or remote provider
 * @returns {Promise}
 */
function getBlackList() {
	return cache.getObject(cacheKey).then(list => {
      if (is.array(list)) {
         if (isStale()) { downloadBlackList(); }
         return list;
      } else {
         return downloadBlackList();
      }
   });
}

/**
 * Whether black list needs to be refreshed
 * @returns {boolean}
 */
function isStale() {
	return lastUpdate === 0 || (
	   config.referralSpam.updateFrequency > 0 &&
      (new Date().getTime() - lastUpdate  > config.referralSpam.updateFrequency)
   );
}

/**
 * @returns {Promise}
 */
function downloadBlackList() {
   if (isDownloading) {
      log.info('Spam referral black list is already downloading');
      return new Promise(resolve => { pending.push(resolve); });
   } else {
      isDownloading = true;
      log.infoIcon(C.icon.cloudDownload, 'Downloading spam referral black list');

      return fetch(config.referralSpam.listUrl)
         .then(res => {
            if (res.status != C.httpStatus.OK) {
               log.error('%s returned status %s', config.referralSpam.listUrl, res.status);
               return null;
            } else {
               return res.text();
            }
         })
         .then(body => {
            let list = [];

            if (is.value(body)) {
               // list of non-empty lines
               list = body.split('\n').filter(i => !is.empty(i));
               lastUpdate = new Date().getTime();
            }
            isDownloading = false;

            if (is.array(list) && list.length > 0) {
               // execute pending callbacks
               for (let c of pending) { c(list); }
               pending = [];
               log.infoIcon(C.icon.banned, 'Downloaded %d blocked domains', list.length);
               cache.add(cacheKey, list);
               return list;
            } else {
               return [];
            }
         })
         .catch(err => {
            log.error('Failed to download referer blacklist: %s', err.toString());
         });
   }
}