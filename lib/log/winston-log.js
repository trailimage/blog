'use strict';

const TI = require('../');
const is = TI.is;
const Enum = TI.enum;
const Winston = require('winston');
const LogBase = TI.Provider.Log.Base;

/**
 * Base for log providers that use Winston
 * @extends TI.Provider.Log.Base
 * @alias TI.Provider.Log.Winston
 */
class WinstonLog extends LogBase {
	constructor(transport) {
		super();
		this.provider = new Winston.Logger({ transports: [ transport ]});
	}

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	info(message, args) { this._invoke(level.info, arguments); }

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String} args
	 */
	infoIcon(icon, message, args) { this._iconInvoke(icon, level.info, arguments); }


	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	warn(message, args) { this._invoke(level.warn, arguments); }

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String} args
	 */
	warnIcon(icon, message, args) { this._iconInvoke(icon, level.warn, arguments); }

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	error(message, args) { this._invoke(level.error, arguments); }

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String} args
	 */
	errorIcon(icon, message, args) { this._iconInvoke(icon, level.error, arguments); }

	/**
	 * @param {Number} daysAgo
	 * @param {Number} maxRows Max rows or callback
	 * @param {Function} callback
	 */
	query(daysAgo, maxRows, callback) {
		/** @see https://github.com/flatiron/winston/blob/master/lib/winston/transports/transport.js */
		const options = {
			from: new Date - (Enum.time.day * daysAgo),
			rows: 500
		};

		this.provider.query(options, (err, results) => {
			if (err === null) {
				callback(parseLogs(results));
			} else {
				this.error(err.toString());
				callback(null);
			}
		});
	}

	/**
	 * Append icon as metadata at the end of the arguments
	 * @param {String} icon
	 * @param {String} level
	 * @param args
	 * @private
	 * @see https://github.com/winstonjs/winston#logging-with-metadata
	 */
	_iconInvoke(icon, level, args) {
		let a = Array.from(args);
		a.shift();
		// avoid conflict with handlebars format function called icon()
		a.push({ iconName: icon });
		this._invoke(level, a);
	}

	/**
	 * @param {String} l
	 * @param args
	 * @private
	 */
	_invoke(l, args) {
		this.provider[l].apply(this.provider, args);
	}
}

module.exports = WinstonLog;

// - Private static members ---------------------------------------------------

const level = {
	debug: 'debug',
	info: 'info',
	warn: 'warn',
	error: 'error'
};

/**
 * Group logs by day
 * @param {Object} results
 * @returns Object
 */
function parseLogs(results) {
	const config = TI.config;
	const format = TI.format;
	let grouped = {};

	if (is.defined(results,'redis')) {
		let day = null;
		let dayKey = null;

		for (let r of results.redis) {
			if (is.defined(r,'message') && is.value(r.message)) {
				r.message = r.message.replace(/"(\d{10,11})"/, '<a href="http://flickr.com/photo.gne?id=$1">$1</a>');
			} else {
				r.message = '[no message]';
			}
			let d = new Date(r.timestamp);
			if (config.isProduction) { d = new Date(d.getTime() + (config.timezone * Enum.time.hour)); }
			let h = d.getHours();

			r.timestamp = format.string('{0}:{1}:{2}.{3} {4}',
				(h > 12) ? h - 12 : h,
				format.leadingZeros(d.getMinutes(), 2),
				format.leadingZeros(d.getSeconds(), 2),
				format.leadingZeros(d.getMilliseconds(), 3),
				(h >= 12) ? 'PM' : 'AM');

			if (!sameDay(day, d)) {
				day = d;
				dayKey = format.string('{0}, {1} {2}', Enum.weekday[d.getDay()], Enum.month[d.getMonth()], d.getDate());
				grouped[dayKey] = [];
			}
			grouped[dayKey].push(r);
		}
	}
	return grouped;
}

/**
 * Whether two timestamps are the same day
 * @param {Date} d1
 * @param {Date} d2
 * @returns Boolean
 */
function sameDay(d1, d2) {
	return (
	d1 != null &&
	d2 != null &&
	d1.getMonth() == d2.getMonth() &&
	d1.getDate() == d2.getDate());
}