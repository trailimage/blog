var Setting = require('../settings.js');
/** @type {singleton} */
var Output = require('../output.js');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	var template = 'search';
	var reply = Output.current.responder(template, res, 'text/html');

	reply.render(template,
	{
		'title': 'Search for &ldquo;' + req.query['q'] + '&rdquo;',
		'setting': Setting
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
//		'setting': Setting
//	});
//}