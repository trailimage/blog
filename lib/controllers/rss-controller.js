'use strict';

const TI = require('../');
const config = TI.config;
const db = TI.active;
const Feed = require('feed');

/**
 * @type Number
 * @const
 */
const MAX_RETRIES = 10;
/** @type Number */
let retries = 0;

/**
 * Default route action
 */
exports.view = (req, res) => {
	let library = TI.Library.current;

	if (!library.postInfoLoaded) {
		if (retries >= MAX_RETRIES) {
			db.log.error('Unable to load library after %d tries', MAX_RETRIES);
			res.render(TI.httpStatus.notFound, {'title': 'Unable to load feed'});
			// reset tries so page can be refreshed
			retries = 0;
		} else {
			retries++;
			db.log.error('Library not ready when creating RSS feed — attempt %d', retries);
			setTimeout(() => { exports.view(req, res); }, 3000);
		}
		return;
	}

	let author = { name: config.owner.name, link: 'https://www.facebook.com/jason.e.abbott' };
	let copyright = 'Copyright © ' + new Date().getFullYear() + ' ' + config.owner.name + '. All rights reserved.';
	let feed = new Feed({
		title: config.site.title,
		description: config.site.description,
		link: 'http://' + config.site.domain,
		image: 'http://' + config.site.domain + '/img/logo.png',
		copyright: copyright,
		author: author
	});

	for (let p of library.posts.filter(p => p.chronological)) {
		feed.addItem({
			image: p.bigThumbURL,
			author: author,
			copyright: copyright,
			title: p.title,
			link: config.site.url + '/' + p.slug,
			description: p.description,
			date: p.createdOn
		});
	}
	res.set('Content-Type', 'text/xml');
	res.send(feed.render('rss-2.0'));
};