'use strict';

const config = require('../config.js');
const Enum = require('../enum.js');
const format = require('../format.js');
const Feed = require('feed');
const db = config.provider;
/**
 * @type {number}
 * @const
 */
const MAX_RETRIES = 10;
/** @type {number} */
var retries = 0;

/**
 * Default route action
 */
exports.view = (req, res) => {
	let library = require('../models/library.js').current;

	if (!library.postInfoLoaded) {
		if (retries >= MAX_RETRIES) {
			db.log.error('Unable to load library after %d tries', MAX_RETRIES);
			res.render(Enum.httpStatus.notFound, {'title': 'Unable to load feed'});
			// reset tries so page can be refreshed
			retries = 0;
		} else {
			retries++;
			db.log.error('Library not ready when creating RSS feed — attempt %d', retries);
			setTimeout(() => { exports.view(req, res); }, 3000);
		}
		return;
	}

	let author = { name: 'Jason Abbott', link: 'https://www.facebook.com/jason.e.abbott' };
	let copyright = 'Copyright © ' + new Date().getFullYear() + ' Jason Abbott. All rights reserved';
	let feed = new Feed({
		title:          config.title,
		description:    config.description,
		link:           'http://' + config.domain,
		image:          'http://' + config.domain + '/img/logo.png',
		copyright:      copyright,
		author:         author
	});

	for (let p of library.posts.filter(p => p.chronological)) {
		feed.addItem({
			image: p.bigThumb,
			author: author,
			copyright: copyright,
			title: p.title,
			link: format.string('http://{0}/{1}/', config.domain, p.slug),
			description: p.description,
			date: p.createdOn
		});
	}
	res.set('Content-Type', 'text/xml');
	res.send(feed.render('rss-2.0'));
};