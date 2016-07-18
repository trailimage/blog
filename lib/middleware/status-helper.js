'use strict';

const { icon, httpStatus } = require('../enum');
const log = require('../logger');
const cache = require('../cache');
const config = require('../config');
const format = require('../format');
const template = require('../template');
const is = require('../is');

module.exports.methods = (req, res, next) => {
	// http://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o
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

	// display "not found" page
	res.notFound = () => {
		log.warnIcon(icon.x, `${req.originalUrl} not found for ${req.clientIP()}`);
		res.status(httpStatus.NOT_FOUND);
		res.render(template.page.notFound, { title: 'Page Not Found', config: config });
	};

	res.internalError = () => {
		res.status(httpStatus.INTERNAL_ERROR);
		res.render(template.page.internalError, { title: 'Oops', config: config });
	};

	next();
};