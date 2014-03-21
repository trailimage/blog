var setting = require('../settings.js');
var layout = 'layouts/issue-layout';

exports.view = function(req, res)
{
	var db = require('../adapters/hash.js');

	db.get('issues', req.params.slug, function(value)
	{
		if (value)
		{
			res.render('issue',
			{
				'docID': value,
				'slug': req.params.slug,
				'setting': setting,
				'layout': layout
			});
		}
		else
		{
			exports.home(req, res);
		}
	});
};

exports.home = function(req, res)
{
	res.render('issue',
	{
		'docID': '1GUgmZwV-nfqyhty4KY2swwY5Vwcgb8Jlwl4esLxy2LA',
		'slug': null,
		'setting': setting,
		'layout': layout
	});
};