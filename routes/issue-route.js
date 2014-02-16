var Setting = require('../settings.js');
var log = require('winston');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');
/** @type {singleton} */
var Cloud = require('../cloud.js');

/** @type {Metadata} */
var metadata = null;

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
				'layout': 'layouts/issue-layout'
			});
		}
		else
		{
			log.warn('"%s" matches no view', req.params.slug);

			res.render('search',
			{
				'sets': Metadata.current.items,
				'title': 'Requested page was not found',
				'setting': Setting
			});
		}
	});
};

