var setting = require('../settings.js');
var library = require('../models/library.js');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	var template = 'search';

	res.render(template,
	{
		'title': 'Search for “' + req.query['q'] + '”',
		'setting': setting
	});

//	reply.send(function(sent)
//	{
//		if (!sent) { render(req.query['q'], reply, template); }
//	});
};

/**
 * @param {String} term
 * @param {Responder} reply
 * @param {String} template
 */
//function render(term, reply, template)
//{
//	reply.render(template,
//	{
//		'title': 'Search for &ldquo;' + term + '&rdquo;',
//		'setting': setting
//	});
//}