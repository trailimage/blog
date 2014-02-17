var Setting = require('../settings.js');
/** @type {singleton} */
var Cloud = require('../cloud.js');
var layout = 'layouts/issue-layout';

exports.view = function(req, res)
{
	Cloud.current.getHashItem('issues', req.params.slug, function(value)
	{
		if (value)
		{
			res.render('issue',
			{
				'docID': value,
				'slug': req.params.slug,
				'setting': Setting,
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
		//'docID': '1GUgmZwV-nfqyhty4KY2swwY5Vwcgb8Jlwl4esLxy2LA',
		'docID': '0B0lgcM9JCuSbYjYxRGIzSTl1bEk',
		'slug': null,
		'setting': Setting,
		'layout': layout
	});
};