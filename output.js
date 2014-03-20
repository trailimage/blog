/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var singleton = {};
var Setting = require('./settings.js');
/** @type {singleton} */
var Metadata = require('./models/library.js');
/** @type {singleton} */
var Cloud = require('./cloud.js');
var log = require('winston');

/**
 * @param {Cloud} cloud
 * @constructor
 */
function Output(cloud)
{
	/** @type {Output} */
	var _this = this;

	/**
	 * @param {String} key
	 * @param {OutputItem} item
	 * @see {@link http://redis.io/commands/hmset}
	 */
	this.add = function(key, item)
	{
		cloud.addHash(key, {'etag': item.eTag, 'buffer': item.bytes.toString('hex') });
	};

	/**
	 * @param {String|String[]} keys
	 * @param {function(Boolean)} [callback]
	 * @see {@link http://redis.io/commands/del}
	 */
	this.remove = function(keys, callback)
	{
		cloud.delete(keys, callback);
	};

	/**
	 * @param {String} key
	 * @param {function(Boolean)} callback
	 * @see {@link http://redis.io/commands/exists}
	 */
	this.has = cloud.exists;

	/**
	 * @param {String} key
	 * @param {function(OutputItem)} callback
	 * @see {@link http://redis.io/commands/hgetall}
	 */
	this.get = function(key, callback)
	{
		cloud.getHash(key, function(hash)
		{
			callback((hash) ? new OutputItem(hash.etag, new Buffer(hash.buffer, 'hex')) : null);
		});
	};

	/**
	 * @param {String} key Cache key
	 * @param {*} res
	 * @param {String} mime MIME type
	 * @returns {Responder}
	 */
	this.responder = function(key, res, mime) { return new Responder(key, res, _this, mime); };

	/**
	 * @param {String} key Cache key
	 * @param {*} res
	 * @param {String} title
	 * @param {String} [template] HBS template
	 * @param {String} [mime] MIME type
	 */
	this.reply = function(key, res, title, template, mime)
	{
		if (template === undefined) { template = key; }

		var reply = new Responder(key, res, _this, mime);

		reply.send(function(sent)
		{
			if (!sent) { reply.render(template, {'title': title}); }
		});
	};

	/**
	 * @param {String} verb
	 * @param {String} key
	 * @param {String} err
	 * @return {Boolean}
	 */
	function hasError(verb, key, err)
	{
		if (err != null)
		{
			log.error('Trying to %s %s resulted in %s', verb, key, err, {});
			return true;
		}
		return false;
	}
}

/**
 * Display "not found" page
 * @param res
 * @param {String} [title]
 */
singleton.replyNotFound = function(res, title)
{
	var reply = new Responder(null, res, singleton.current);
	reply.notFound(title);
};

/**
 * @param {String} key
 * @param {Buffer} bytes
 * @constructor
 */
function OutputItem(key, bytes)
{
	/** @type {Buffer} */
	this.bytes = bytes;
	/** @type {String} */
	this.eTag = key + (new Date()).getTime().toString();
}

/**
 *
 * @param {String} key
 * @param res
 * @param {Output} output
 * @param {String} [mime]
 * @constructor
 */
function Responder(key, res, output, mime)
{
	mime = (mime === undefined) ? 'text/html' : mime;

	/**
	 * @param {String} template
	 * @param {Object} values
	 * @param {function(String)} [format = null] Optional HTML formatter
	 */
	this.render = function(template, values, format)
	{
		if (!values.description && values.hasOwnProperty('setting'))
		{
			values.description = values.setting.description;
		}

		res.render(template, values, function(err, text)
		{
			if (format) { text = format(text); }

			compress.gzip(text, function(err, buffer)
			{
				var item = new OutputItem(key, buffer);
				if (Setting.cacheOutput) { output.add(key, item); }
				sendCompressed(buffer, item.eTag);
			});
		});
	};

	/**
	 * Display "not found" page
	 * @param {string} [title]
	 */
	this.notFound = function(title)
	{
		log.warn('"%s" matches no view', title);

		title = (title) ? '“' + title + '” Was Not Found' : 'Not Found';

		res.render('search',
		{
			'sets': Metadata.current.items,
			'title': title,
			'setting': Setting
		});
	};

	/**
	 * Send cached response
	 * @param {function(Boolean)} callback
	 */
	this.send = function(callback)
	{
		if (Setting.cacheOutput)
		{
			output.get(key, function(item)
			{
				if (item != null)
				{
					sendCompressed(item.bytes, item.eTag);
					callback(true);
				}
				else
				{
					log.info('"%s" not cached', key);
					callback(false);
				}
			});
		}
		else
		{
			callback(false);
		}
	};

	/**
	 *
	 * @param {Buffer} buffer
	 * @param {String} eTag
	 */
	function sendCompressed(buffer, eTag)
	{
		"use strict";

		res.setHeader('Content-Encoding', 'gzip');
		res.setHeader('Cache-Control', 'max-age=86400, public');
		res.setHeader('ETag', eTag);
		res.setHeader('Content-Type', mime + ';charset=utf-8');
		res.write(buffer);
		res.end();
	}
}

/** @type {Output} */
singleton.current = null;

singleton.make = function()
{
	log.info('Constructing output cache');
	singleton.current = new Output(Cloud.current);
};

module.exports = singleton;