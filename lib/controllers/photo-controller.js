'use strict';

var setting = require('../settings.js');
var is = require('../is.js');
var re = require('../regex.js');
var format = require('../format.js');
var Enum = require('../enum.js');
var flickr = require('./flickr.js');
var library = require('../models/library.js');
var log = require('../log.js');

const numericRange = /\d\-\d/;

/**
 * Default route action
 * @var {Flickr.Exif[]} exif
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.exif = (req, res) => {
    /** @type {string} */
    var photoID = req.params['photoID'];

    flickr.getEXIF(photoID, exif => {
        let values = exifValues(exif, [
            'Artist',
            'ExposureCompensation',
            'ExposureTime',
            'FNumber',
            'FocalLength',
            'ISO',
            'Lens',
            'Model',
            'Software'
        ]);

	    if (is.value(values.Artist) && re.artist.test(values.Artist)) {
		    // only sanitize EXIF for photos shot by known artists
		    values.Model = sanitizeCamera(values.Model);
		    values.Lens = sanitizeLens(values.Lens, values.Model);
		    values.ExposureCompensation = sanitizeCompensation(values.ExposureCompensation);
			// don't show focal length for primes
		    if (!numericRange.test(values.Lens)) { values.FocalLength = null; }
	    }

	    values.Software = sanitizeSoftware(values.Software);

        res.render('exif', { 'exif': values, 'layout': null });
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
	for (let key in list) {	tags[key.substr(0, 1).toLowerCase()][key] = list[key]; }

	res.render('photo-tag', {
		'tags': tags,
		'selected': selected,
		'alphabet': alphabet,
		'title': keys.length + ' Photo Tags',
		'setting': setting
	});
};

/**
 * Find and show post with given photo ID
 * @param req
 * @param res
 */
exports.view = (req, res) => {
	/** @type {string} */
	var photoID = req.params['photoID'];

	/** @var {Flickr.MemberSet[]} sets */
	flickr.getContext(photoID, sets => {
		if (sets) {
			for (let s of sets) {
				let postID = s.id;

				if (postID !== setting.flickr.featureSet) {
					let post = library.postWithID(postID);

					if (post !== null) {
						res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug + '#' + photoID);
					} else {
						res.notFound();
					}
					return;
				}
			}
		}
		res.notFound();
	});
};

exports.search = (req, res) => {
	let slug = req.params['tagSlug'];

	flickr.tagSearch([slug], photos => {
		if (photos === null) {
			res.notFound();
		} else {
			let tag = library.photoTags[slug];
			let title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

			res.render('photo-search', {
				'photos': photos,
				'setting': setting,
				'title': title,
				'layout': null
			});
		}
	});
};

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeCamera(text) {
	return (is.empty(text)) ? '' : text
		.replace('NIKON', 'Nikon')
		.replace('ILCE-7R', 'Sony α7ʀ')
		.replace('ILCE-7RM2', 'Sony α7ʀ II')
		.replace('Sony α7ʀM2', 'Sony α7ʀ II')
		.replace('VS980 4G', 'LG G2')
		.replace('XT1060', 'Motorola Moto X')
		.replace('TG-4', 'Olympus Tough TG-3');
}

/**
 * @param {String} text
 * @param {String} camera For some reason the Zeiss EXIF on the D700 was generic
 * @returns {String}
 */
function sanitizeLens(text, camera) {
	return (is.empty(text)) ? '' : text
		.replace(/FE 35mm.*/i, 'Sony FE 35mm ƒ2.8')
		.replace(/FE 55mm.*/i, 'Sony FE 55mm ƒ1.8')
		.replace(/FE 90mm.*/i, 'Sony FE 90mm ƒ2.8 OSS')
		.replace('58.0 mm f/1.4', 'Voigtländer Nokton 58mm ƒ1.4 SL II')
		.replace('14.0 mm f/2.8', 'Samyang 14mm ƒ2.8')
		.replace('50.0 mm f/1.4', 'Sigma 50mm ƒ1.4 EX DG')
		.replace('35.0 mm f/2.0', (/D700/.test(camera) ? 'Zeiss Distagon T* 2/35 ZF.2' : 'Nikkor 35mm ƒ2.0D'))
		.replace('100.0 mm f/2.0', 'Zeiss Makro-Planar T* 2/100 ZF.2')
		.replace('150.0 mm f/2.8', 'Sigma 150mm ƒ2.8 EX DG HSM APO')
		.replace('90.0 mm f/2.8', 'Tamron 90mm ƒ2.8 SP AF Di')
		.replace('24.0 mm f/3.5', 'Nikkor PC-E 24mm ƒ3.5D ED')
		.replace('14.0-24.0 mm f/2.8', 'Nikon 14–24mm ƒ2.8G ED')
		.replace('24.0-70.0 mm f/2.8', 'Nikon 24–70mm ƒ2.8G ED')
		.replace('17.0-55.0 mm f/2.8', 'Nikon 17–55mm ƒ2.8G')
		.replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10–20mm ƒ4–5.6 EX DC HSM')
		.replace('1 NIKKOR VR 30-110mm f/3.8-5.6', 'Nikkor 1 30–110mm ƒ3.8–5.6 VR')
		.replace('1 NIKKOR VR 10-30mm f/3.5-5.6', 'Nikkor 1 10–30mm ƒ3.5–5.6 VR')
		.replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18–200mm ƒ3.5–5.6G ED VR')
		.replace(/Voigtlander Heliar 15mm.*/i, 'Voigtländer Heliar 15mm ƒ4.5 III');
}

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeSoftware(text) {
	return (is.empty(text)) ? '' : text
		.replace('Photoshop Lightroom', 'Lightroom')
		.replace(/\s*\(Windows\)/, '');
}

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeCompensation(text) {
	if (text == '0') { text = 'No'; }
	return text;
}

/**
 * Create object with tag keys and string values from EXIF
 * @param {Flickr.Exif[]} exif
 * @param {String[]} tags
 * @return {Object.<string>}
 */
function exifValues(exif, tags) {
    var values = {};
	for (let t of tags) { values[t] = exifValue(exif, t); }
    return values;
}

/**
 *
 * @param {Flickr.Exif[]} exif
 * @param {String} tag
 * @returns {String}
 */
function exifValue(exif, tag) {
	for (let x of exif) { if (x.tag == tag) { return x.raw._content; }	}
	return null;
}
