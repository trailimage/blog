var setting = require('../settings.js');
var format = require('../format.js');
var Enum = require('../enum.js');
//var photoTag = require('../models/photo-tag.js');
var flickr = require('../adapters/flickr.js');
var library = require('../models/library.js');
var log = require('winston');
var retries = {};

/**
 * Default route action
 * @var {Flickr.Exif[]} exif
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.exif = function(req, res)
{
    /** @type {string} */
    var photoID = req.params['photoID'];

    flickr.getEXIF(photoID, function(exif)
    {
        var values = exifValues(exif, [
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

	    if (values.Artist && Enum.pattern.artist.test(values.Artist))
	    {
		    values.Model = sanitizeCamera(values.Model);
		    values.Lens = sanitizeLens(values.Lens, values.Model);
		    values.ExposureCompensation = sanitizeCompensation(values.ExposureCompensation);
			// don't show focal length for primes
		    if (!/\d\-\d/.test(values.Lens)) { values.FocalLength = null; }
	    }

	    values.Software = sanitizeSoftware(values.Software);

        res.render('exif', { 'exif': values, 'layout': null });
    });
};

exports.tags = function(req, res)
{
	var selected = req.params['tagSlug'];
	var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var list = library.photoTags;
	var keys = Object.keys(list);
	var tags = {};

	if (format.isEmpty(selected))
	{
		// select a random tag
		selected = keys[Math.floor((Math.random() * keys.length) + 1)];
	}

	// group tags by first letter
	for (var i = 0; i < alphabet.length; i++) { tags[alphabet[i]] = {}; }
	for (var key in list) {	tags[key.substr(0, 1).toLowerCase()][key] = list[key]; }

	res.render('photo-tag',
	{
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
exports.view = function(req, res)
{
	/** @type {string} */
	var photoID = req.params['photoID'];
	/** @type {string} */
	var postID;

	/** @var {Flickr.MemberSet[]} sets */
	flickr.getContext(photoID, function(sets)
	{
		if (sets)
		{
			for (var i = 0; i < sets.length; i++)
			{
				postID = sets[i].id;

				if (postID != setting.flickr.featureSet)
				{
					var post = library.postWithID(postID);

					if (post != null)
					{
						res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug + '#' + photoID);
					}
					else
					{
						res.notFound();
					}
					return;
				}
			}
		}
		res.notFound();
	});
};

exports.search = function(req, res)
{
	var slug = req.params['tagSlug'];

	flickr.tagSearch([slug], function(photos)
	{
		if (photos == null)
		{
			res.notFound();
		}
		else
		{
			var tag = library.photoTags[slug];
			var title = format.sayNumber(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

			res.render('photo-search',
			{
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
function sanitizeCamera(text)
{
	return (format.isEmpty(text)) ? '' : text
		.replace('NIKON', 'Nikon')
		.replace('ILCE-7R', 'Sony α7R')
		.replace('XT1060', 'Motorola Moto X')
}

/**
 * @param {String} text
 * @param {String} camera For some reason the Zeiss EXIF on the D700 was generic
 * @returns {String}
 */
function sanitizeLens(text, camera)
{
	return (format.isEmpty(text)) ? '' : text
		.replace('FE 35mm F2.8 ZA', 'Sony FE 35mm ƒ2.8')
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
		.replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18–200mm ƒ3.5–5.6G ED VR');
}

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeSoftware(text)
{
	return (format.isEmpty(text)) ? '' : text
		.replace('Photoshop Lightroom', 'Lightroom')
		.replace(/\s*\(Windows\)/, '');
}

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeCompensation(text)
{
	if (text == '0') { text = 'No'; }
	return text;
}

/**
 * Create object with tag keys and string values from EXIF
 * @param {Flickr.Exif[]} exif
 * @param {String[]} tags
 * @return {Object.<string>}
 */
function exifValues(exif, tags)
{
    var values = {};

    for (var i = 0; i < tags.length; i++)
    {
        values[tags[i]] = exifValue(exif, tags[i]);
    }
    return values;
}

function exifValue(exif, tag)
{
    for (var i = 0; i < exif.length; i++)
    {
        if (exif[i].tag == tag) { return exif[i].raw._content; }
    }
    return null;
}
