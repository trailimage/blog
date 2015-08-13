"use strict";

var Format = require('../format.js');
var library = require('../models/library.js');
var flickr = require('../adapters/flickr.js');
var PDFDocument = require('pdfkit');
var fs = require('fs');
var http = require('http');
var log = require('winston');

/**
 * Photo sizes to retrieve from FlickrAPI API
 * @type {string[]}
 */
const sizes = [
	flickr.size.large1024,
	flickr.size.large1600
];
const dpi = 300;

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = function(req, res) {
	/** @type {Post} */
	var post = library.postWithSlug(req.params.slug);

	if (post != null) {
		flickr.getSet(post.id, sizes, function(setPhotos, setInfo) {
			let pdf = new PDFDocument({
				size: 'letter',
				layout: 'portrait',
				margins: 0,
				info: {
					Title: post.title,
					Author: 'Jason Abbott'
				}
			});

			//pdf.addPage({size: 'letter', layout: 'portrait'});
			pdf.registerFont('Serif', 'fonts/georgia.ttf');
			pdf.registerFont('San Serif', 'fonts/trebuc.ttf');
			pdf.registerFont('San Serif Bold', 'fonts/trebucbd.ttf');

			pdf.moveDown(2);
			pdf.font('San Serif Bold').fontSize(40).text(post.title, {align: 'center'});
			pdf.moveDown(1);
			pdf.font('San Serif').fontSize(15).text('by Jason Abbott', {align: 'center'});
			pdf.text(setPhotos.photo[0].datetaken, {align: 'center'});

			pdf.font('Serif').fontSize(11);

			pdf.moveDown(2);

			writePdfPhoto(pdf, setPhotos.photo, 0, function() {
				pdf.output(function(buffer) {
					//res.setHeader('Cache-Control', 'max-age=86400, public');
					res.setHeader('Content-Disposition', 'inline; filename="' + post.title + ' by Jason Abbott.pdf"');
					res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
					res.end(buffer, 'binary');
				});
			})
		});
	}
};

/**
 * @param {PDFDocument} pdf
 * @param {Flickr.PhotoSummary[]} photos
 * @param {int} index
 * @param {Function} callback
 */
function writePdfPhoto(pdf, photos, index, callback) {
	/** @type {Flickr.PhotoSummary} */
	var p = null;

	if (index < photos.length) {
		p = photos[index];

		getImage(p.url_l, p.id, function(fileName) {
			pdf.addPage({margins: {top: 0, right: 0, bottom: 0, left: 0}, layout: 'landscape'});

			pdf.image(fileName, {fit: [11 * dpi, 8.5 * dpi]});
			pdf.text(p.description._content, dpi * 0.5, null, {width: 10 * dpi});
			//pdf.moveDown(2);

			writePdfPhoto(pdf, photos, index + 1, callback);
		});
	} else {
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
function getImage(url, fileName, callback) {
	fileName = 'temp/image/' + fileName + '.jpg';

	fs.exists(fileName, function(exists) {
		if (exists) {
			callback(fileName);
		} else {
			console.log('downloading ' + url + ' to ' + fileName);

			let req = http.get(url, function(res) {
				let body = '';
				res.setEncoding('binary');
				res.on('data', function(chunk) { body += chunk; });
				res.on('end', function() {
					fs.writeFile(fileName, body, 'binary', function(err) {
						callback(fileName);
					});
				})
			});
			req.on('error', function(e) { log.error(e.message); })
		}
	});
}