'use strict';

const Blog = require('../');
const template = Blog.template;
const is = Blog.is;
const db = Blog.active;
const library = Blog.Library.current;

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
	let selected = decodeURIComponent(req.params['tagSlug']);
	const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
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
		config: Blog.config
	});
};

/**
 * Find and show post with given photo ID
 * @param req
 * @param res
 */
exports.view = (req, res) => {
	/** @type String */
	let photoID = req.params['photoID'];

	db.photo.loadPhotoPostID(photoID, postID => {
		let post = library.postWithID(postID);

		if (post !== null) {
			res.redirect(Blog.httpStatus.permanentRedirect, '/' + post.slug + '#' + photoID);
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
	let slug = decodeURIComponent(req.params['tagSlug']);

	db.photo.loadPhotosWithTags(slug, photos => {
		if (photos === null || photos.length == 0) {
			res.notFound();
		} else {
			let tag = library.photoTags[slug];
			let title = Blog.format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

			res.render(template.page.photoSearch, {
				photos: photos,
				config: Blog.config,
				title: title,
				layout: template.layout.none
			});
		}
	});
};
