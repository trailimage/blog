/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.render('search',
	{
		'title': 'Search for “' + req.query['q'] + '”',
		'setting': require('../settings.js')
	});
};
