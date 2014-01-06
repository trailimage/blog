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
		    values.ExposureCompensation = normalizeCompensation(values.ExposureCompensation);
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
		.replace('14.0 mm f/2.8', 'Samyang 14mm f/2.8')
		.replace('50.0 mm f/1.4', 'Sigma 50mm f/1.4 EX DG')
		.replace('35.0 mm f/2.0', 'Nikkor 35mm f/2.0D')
		.replace('150.0 mm f/2.8', 'Sigma 150mm f/2.8 EX DG HSM APO')
		.replace('90.0 mm f/2.8', 'Tamron 90mm f/2.8 SP AF Di')
		.replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10-20mm f/4-5.6 EX DC HSM')
		.replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18-200mm f/3.5-5.6G ED VR');
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
 * @param {String} text
 * @returns {String}
 */
function normalizeCompensation(text)
{
	if (text == '0') { text = 'No'; }
	return text;
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
