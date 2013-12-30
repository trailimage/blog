var Setting = require('../settings.js');
/** @type {singleton} */
var Output = require('../output.js');
/** @type {singleton} */
var Metadata = require('../metadata/metadata.js');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	var template = 'search';
	var reply = Output.current.responder(template, res, 'text/html');

	if (!Metadata.current.setInfoLoaded)
	{
		// don't cache until all item info is loaded since search page shows lazy loaded thumbs
		render(reply, template);
	}
	else
	{
		reply.send(function(sent)
		{
			if (!sent) { render(reply, template); }
		});
	}
};

/**
 * @param {Responder} reply
 * @param {String} template
 */
function render(reply, template)
{
	reply.render(template,
	{
		'sets': Metadata.current.sets,
		'title': 'Search ' + Setting.title,
		'setting': Setting
	});
}