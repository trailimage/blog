'use strict';

const e = require('../constants');
const log = require('../logger');
const cache = require('../cache');
const config = require('../config');
const format = require('../format');
const template = require('../template');
const is = require('../is');

/**
 * Express middleware
 * Add expando methods to response and request objects
 * @returns {function}
 */
module.exports.methods = (req, res, next) => {
   /**
    * @returns {string}
    * @see http://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o
    */
	req.clientIP = () => {
		let ipAddress = req.connection.remoteAddress;
		let forwardedIP = req.header('x-forwarded-for');

		if (!is.empty(forwardedIP)) {
			// contains delimited list like "client IP, proxy 1 IP, proxy 2 IP"
			let parts = forwardedIP.split(',');
			ipAddress = parts[0];
		}
		return format.IPv6(ipAddress);
	};

   /**
    * Display "not found" page
    */
	res.notFound = () => {
		log.warnIcon(e.icon.x, `${req.originalUrl} not found for ${req.clientIP()}`);
		res.status(e.httpStatus.NOT_FOUND);
		res.render(template.page.notFound, { title: 'Page Not Found', config: config });
	};

	res.internalError = () => {
		res.status(e.httpStatus.INTERNAL_ERROR);
		res.render(template.page.internalError, { title: 'Oops', config: config });
	};

	next();
};