'use strict';

const C = require('../constants');
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
module.exports.apply = (req, res, next) => {
   /**
    * Get corrected client IP
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
		log.warnIcon(C.icon.x, `${req.originalUrl} not found for ${req.clientIP()}`);
		res.status(C.httpStatus.NOT_FOUND);
		res.render(template.page.NOT_FOUND, { title: 'Page Not Found', config: config });
	};

	res.internalError = () => {
		res.status(C.httpStatus.INTERNAL_ERROR);
		res.render(template.page.INTERNAL_ERROR, { title: 'Oops', config: config });
	};

	next();
};