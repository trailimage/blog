var Format = require('../format.js');
/** @type {singleton} */
var Flickr = require('../flickr.js');
var log = require('winston');

/**
 * Default route action
 * @var {Array.<Flickr.Exif>} exif
 * @see {@link http://www.flickr.com/services/api/flickr.photos.getExif.html}
 */
exports.exif = function(req, res)
{
    /** @type {string} */
    var photoID = req.params.photoID;

    Flickr.current.getEXIF(photoID, function(exif)
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

	    if (values.Artist && /Abbott/.test(values.Artist))
	    {
		    values.Model = normalizeCamera(values.Model);
		    values.Lens = normalizeLens(values.Lens);
	    }

	    values.Software = normalizeSoftware(values.Software);

        res.render('exif', { 'exif': values, 'layout': null });
    });
};

/**
 * @param {String} text
 * @returns {String}
 */
function normalizeCamera(text)
{
	return text.replace('NIKON', 'Nikon');
}

/**
 * @param {String} text
 * @returns {String}
 */
function normalizeLens(text)
{
	return text
		.replace('58.0 mm f/1.4', 'Voigtländer Nokton 58mm f/1.4 SL II')
		.replace('14.0 mm f/2.8', 'Samyang 14mm f/2.8');
}

/**
 * @param {String} text
 * @returns {String}
 */
function normalizeSoftware(text)
{
	return text
		.replace('Photoshop Lightroom', 'Lightroom')
		.replace(/\s*\(Windows\)/, '');
}

/**
 * Create object with tag keys and string values from EXIF
 * @param {Array.<Flickr.Exif>} exif
 * @param {Array.<string>} tags
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
