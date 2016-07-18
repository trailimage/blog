'use strict';

const load = require('../loader')('./middleware/*.js');

module.exports = {
   get outputCache() { return load('output-cache'); },
   get referralBlocker() { return load('referral-blocker'); },
   get statusHelper() { return load('status-helper'); }
};