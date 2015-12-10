'use strict';

const lib = require('../');
const template = lib.template;
const is = lib.is;
const db = lib.provider;
const library = lib.Library.current;

/**
 * Render small HTML table of EXIF values for given photo
 * @var {EXIF} exif
 */
exports.exif = (req, res) => {
	db.photo.loadExif(req.params['photoID'], exif => {
		res.render(template.page.exif, { exif: exif, layout: template.layout.none });
	});
};

exports.tags = (req, res) => {
	let selected = req.params['tagSlug'];
	let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	let list = library.photoTags;
	let keys = Object.keys(list);
	let tags = {};

	if (is.empty(selected)) {
		// select a random tag
		selected = keys[Math.floor((Math.random() * keys.length) + 1)];
	}

	// group tags by first letter (character)
	for (let c of alphabet) { tags[c] = {}; }
	for (let key in list) {
		let c = key.substr(0, 1).toLowerCase();
		if (alphabet.indexOf(c) >= 0)  { tags[c][key] = list[key]; }
	}

	res.render(template.page.photoTag, {
		tags: tags,
		selected: selected,
		alphabet: alphabet,
		title: keys.length + ' Photo Tags',
		config: lib.config
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

	db.photo.loadPhotoPostID(photoID, postID => {
		let post = library.postWithID(postID);

		if (post !== null) {
			res.redirect(lib.enum.httpStatus.permanentRedirect, '/' + post.slug + '#' + photoID);
		} else {
			res.notFound();
		}
	});
};

/**
 * Display photos for given tag
 * @param req
 * @param res
 */
exports.withTag = (req, res) => {
	let slug = req.params['tagSlug'];

	db.photo.loadPhotosWithTags(slug, photos => {
		if (photos === null || photos.length == 0) {
			res.notFound();
		} else {
			let tag = library.photoTags[slug];
			let title = lib.format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

			res.render(template.page.photoSearch, {
				photos: photos,
				config: lib.config,
				title: title,
				layout: template.layout.none
			});
		}
	});
};
