var Format = require('../format.js');
/** @type {singleton} */
var Flickr = require('../flickr.js');
var log = require('winston');

/**
 * Default route action
 * @var {Array.<Flickr.Exif>} exif
 */
exports.exif = function(req, res)
{
    /** @type {string} */
    var photoID = req.params.photoID;

    flickr.getEXIF(photoID, function(exif)
    {
        res.render('exif', { 'exif': exif, 'layout': null });
    });
};
