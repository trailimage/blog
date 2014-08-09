/**
 * Default route action
 */
exports.view = function(req, res)
{
	var term = req.query['q'];

	if (term != undefined)
	{
		res.render('search',
		{
			'title': 'Search for “' + req.query['q'] + '”',
			'setting': require('../settings.js')
		});
	}
	else
	{
		res.notFound();
	}
};
