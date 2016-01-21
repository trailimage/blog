'use strict';

const Blog = require('./');
const config = Blog.config;
const format = Blog.format;
const is = Blog.is;
const template = Blog.template;

/**
 * Express middleware
 * Add expando methods to response and request objects
 * @returns {Function}
 */
module.exports.methods = (req, res, next) => {
	/**
	 * @returns {String}
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
		Blog.active.log.warnIcon(Blog.icon.x, `${req.originalUrl} not found for ${req.clientIP()}`);
		res.status(Blog.httpStatus.notFound);
		res.render(template.page.notFound, { title: 'Page Not Found', config: config });
	};

	res.internalError = () => {
		res.status(Blog.httpStatus.internalError);
		res.render(template.page.internalError, { title: 'Oops', config: config });
	};

	next();
};