'use strict';

const format = require('../format.js');
const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const http = require('http');
const request = require('request');

//const sizes = [
//	db.size.large1024,
//	db.size.large1600
//];
const dpi = 300;

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let pdf = new PDFDocument({
				size: 'letter',
				layout: 'landscape',
				margins: 0,
				info: {
					Title: post.title,
					Author: 'Jason Abbott'
				}
			});

			//pdf.addPage({size: 'letter', layout: 'portrait'});
			pdf.registerFont('Serif', 'dist/fonts/lora-101b41c4d985d4e5b5addbed77bbedfc1d55d89a.ttf', 'Lora');
			pdf.registerFont('San Serif', 'dist/fonts/droidsans-ea469d63bf279daeb58f104d71e6e0f0d62f93af.ttf', 'Droid Sans');
			pdf.registerFont('San Serif Bold', 'dist/fonts/oswald-641e7f512fab8283a2a459253c6e3a148216997e.ttf', 'Oswald');

			pdf.moveDown(2);
			pdf.font('San Serif Bold').fontSize(40).text(post.title, {align: 'center'});
			pdf.moveDown(1);
			pdf.font('San Serif').fontSize(15).text('by Jason Abbott', {align: 'center'});
			pdf.text(post.photos[0].datetaken, {align: 'center'});

			pdf.font('Serif').fontSize(11);

			pdf.moveDown(2);

			writePdfPhoto(pdf, post.photos, 0, () => {
				pdf.pipe(res);
				pdf.end();

				//pdf.output(buffer => {
				//	//res.setHeader('Cache-Control', 'max-age=86400, public');
				//	res.setHeader('Content-Disposition', 'inline; filename="' + post.title + ' by Jason Abbott.pdf"');
				//	res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
				//	res.end(buffer, 'binary');
				//});
			});
		});
	}
};

/**
 * @param {PDFDocument} pdf
 * @param {Photo[]} photos
 * @param {int} index
 * @param {Function} callback
 */
function writePdfPhoto(pdf, photos, index, callback) {
	/** @type {Photo} */
	var p = null;

	if (index < photos.length) {
		p = photos[index];

		getImage(p.size.normal.url, buffer => {
			pdf.addPage({margins: {top: 0, right: 0, bottom: 0, left: 0}, layout: 'landscape'});

			pdf.image(buffer, {fit: [11 * dpi, 8.5 * dpi]});
			pdf.text(p.description, dpi * 0.5, null, {width: 10 * dpi});
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
 * @param {function(Buffer)} callback
 * @see http://stackoverflow.com/questions/12740659/downloading-images-with-node-js
 * @see https://github.com/request/request#streaming
 */
function getImage(url, callback) {
	url = url.replace('https', 'http');

	let req = http.get(url, res => {
		let body = '';
		res.setEncoding('binary');
		res.on('data', chunk => { body += chunk; });
		res.on('end', () => { callback(new Buffer(body, 'binary')); })
	});
	req.on('error', e => { db.log.error(e.message); });
}