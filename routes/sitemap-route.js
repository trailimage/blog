/** @type {singleton} */
var Output = require('../output.js');
/** @type {Library} */
var Library = require('../models/library.js');
/** @type {String} */
var key = 'sitemap';
var log = require('winston');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	/** @type {Responder} */
	var reply = Output.current.responder(key, res, 'application/xml');
	/** @type {Library} */
	var library = Library.current;

	reply.send(function(sent)
	{
		if (sent) { return; }

		reply.render('sitemap-xml',
		{
			'posts': library.posts,
			'tags': library.tagSlugs(),
			'layout': null
		});
	});
};

exports.clear = function(req, res)
{
	log.warn('Clearing sitemap from cache');
	Output.current.remove(key, function(done) { res.redirect('/' + key + '.xml'); });
};