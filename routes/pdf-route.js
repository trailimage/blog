var Setting = require('../settings.js');
var Format = require('../format.js');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');
/** @type {singleton} */
var Flickr = require('../flickr.js');
var PDFDocument = require('pdfkit');
var fs = require('fs');
var http = require('http');
var log = require('winston');

/**
 * Photo sizes to retrieve from FlickrAPI API
 * @type {Array.<String>}
 */
var sizes = [
	Flickr.size.large1024,
	Flickr.size.large1600
];

/**
 * Default route action
 */
exports.view = function(req, res)
{
	/** @type {Metadata} */
	var metadata = Metadata.current;
	/** @type {FlickrAPI} */
	var flickr = Flickr.current;
	/** @type {Metadata.Set} */
	var set = metadata.setWithSlug(req.params.slug);

	if (set != null)
	{
		flickr.getSet(set.id, sizes, function(setPhotos, setInfo)
		{
			/** @type {PDFDocument} */
			var pdf = new PDFDocument(
			{
				size: 'letter',
				layout: 'portrait',
				info:
				{
					Title: set.title,
					Author: 'Jason Abbott'
				}
			});

			//pdf.addPage({size: 'letter', layout: 'portrait'});
			pdf.registerFont('Serif', 'fonts/georgia.ttf');
			pdf.registerFont('San Serif', 'fonts/trebuc.ttf');
			pdf.registerFont('San Serif Bold', 'fonts/trebucbd.ttf');

			pdf.font('San Serif Bold').fontSize(35).text(set.title);
			pdf.font('San Serif').fontSize(15).text('by Jason Abbott');
			pdf.text(setPhotos.photo[0].datetaken, {align: 'right'});

			pdf.font('Serif').fontSize(11);

			pdf.moveDown(2);

			writePdfPhoto(pdf, setPhotos.photo, 0, function()
			{
				pdf.output(function(buffer)
				{
					//res.setHeader('Cache-Control', 'max-age=86400, public');
					res.setHeader('Content-Disposition', 'inline; filename="' + set.title + ' by Jason Abbott.pdf"');
					res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
					res.end(buffer, 'binary');
				});
			})
		});
	}
};

/**
 * @param {PDFDocument} pdf
 * @param {Array.<FlickrAPI.PhotoSummary>} photos
 * @param {int} index
 * @param {Function} callback
 */
function writePdfPhoto(pdf, photos, index, callback)
{
	/** @type {FlickrAPI.PhotoSummary} */
	var p = null;

	if (index < photos.length)
	{
		p = photos[index];

		getImage(p.url_l, p.id, function(fileName)
		{
			log.info(fileName);
			pdf.image(fileName);
			pdf.text(p.description._content);
			pdf.moveDown(2);

			writePdfPhoto(pdf, photos, index + 1, callback);
		});
	}
	else
	{
		callback();
	}
}

/**
 *
 * @param {String} url
 * @param {String} fileName
 * @param {Function} callback
 * @see http://stackoverflow.com/questions/12740659/downloading-images-with-node-js
 */
function getImage(url, fileName, callback)
{
	fileName = 'temp/image/' + fileName + '.jpg';

	fs.exists(fileName, function(exists)
	{
		if (exists)
		{
			callback(fileName);
		}
		else
		{
			// console.log('downloading ' + url + ' to ' + fileName);

			var req = http.get(url, function(res)
			{
				var body = '';
				res.setEncoding('binary');
				res.on('data', function(chunk) { body += chunk; });
				res.on('end', function()
				{
					fs.writeFile(fileName, body, 'binary', function(err)
					{
						callback(fileName);
					});
				})
			});

			req.on('error', function(e) { console.log(e); })
		}
	});
}