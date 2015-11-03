'use strict';

const config = require('../config.js');
const template = require('../template.js');
const is = require('../is.js');
const format = require('../format.js');
const Enum = require('../enum.js');
const db = config.provider.data;
const library = require('../models/library.js').current;

/**
 * Render small HTML table of EXIF values for given photo
 * @var {EXIF} exif
 */
exports.exif = (req, res) => {
	db.exif(req.params['photoID'], exif => {
		res.render(template.page.exif, { exif: exif, layout: template.layout.none });
	});
};

exports.tags = (req, res) => {
	var selected = req.params['tagSlug'];
	var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var list = library.photoTags;
	var keys = Object.keys(list);
	var tags = {};

	if (is.empty(selected)) {
		// select a random tag
		selected = keys[Math.floor((Math.random() * keys.length) + 1)];
	}

	// group tags by first letter
	for (let i = 0; i < alphabet.length; i++) { tags[alphabet[i]] = {}; }
	for (let key in list) {
		let letter = key.substr(0, 1).toLowerCase();
		if (alphabet.indexOf(letter) >= 0)  { tags[letter][key] = list[key]; }
	}

	res.render(template.page.photoTag, {
		tags: tags,
		selected: selected,
		alphabet: alphabet,
		title: keys.length + ' Photo Tags',
		config: config
	});
};

/**
 * Find and show post with given photo ID
 * @param req
 * @param res
 */
exports.view = (req, res) => {
	/** @type {string} */
	let photoID = req.params['photoID'];

	db.loadPhotoPostID(photoID, postID => {
		if (postID !== config.flickr.photoSet.featured) {
			let post = library.postWithID(postID);

			if (post !== null) {
				res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug + '#' + photoID);
			} else {
				res.notFound();
			}
			return;
		}
		res.notFound();
	});
};

/**
 * Display photos for given tag
 * @param req
 * @param res
 */
exports.withTag = (req, res) => {
	let slug = req.params['tagSlug'];

	db.loadPhotosWithTags(slug, photos => {
		if (photos === null || photos.length == 0) {
			res.notFound();
		} else {
			let tag = library.photoTags[slug];
			let title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

			res.render(template.page.photoSearch, {
				photos: photos,
				config: config,
				title: title,
				layout: template.layout.none
			});
		}
	});
};
