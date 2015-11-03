'use strict';

const is = require('./../is.js');
const re = require('../regex.js');

class EXIF {
	constructor() {
		/** @type {String} */
		this.artist = null;
		/** @type {String} */
		this.compensation = null;
		this.time = 0;
		this.fNumber = 0;
		this.focalLength = 0;
		this.ISO = 0;
		/** @type {String} */
		this.lens = null;
		/** @type {String} */
		this.model = null;
		/** @type {String} */
		this.software = null;
		/** @type {Boolean} */
		this.sanitized = false;
	}

	/**
	 * @param {Object} source Raw EXIF data
	 * @param {function(Object, String)} parser Method to get value from raw EXIF
	 */
	populate(source, parser) {
		this.artist = parser(source, 'Artist');
		this.compensation = parser(source, 'ExposureCompensation');
		this.time = parser(source, 'ExposureTime');
		this.fNumber = parser(source, 'FNumber');
		this.ISO = parser(source, 'ISO');
		this.lens = parser(source, 'Lens');
		this.model = parser(source, 'Model');
		this.software = parser(source, 'Software');
	}

	/**
	 *
	 */
	sanitize() {
		if (!this.sanitized) {
			if (is.value(this.Artist) && re.artist.test(this.Artist)) {
				// only sanitize EXIF for photos shot by known artists
				this.Model = sanitizeCamera(this.Model);
				this.Lens = sanitizeLens(this.Lens, this.Model);
				this.ExposureCompensation = sanitizeCompensation(this.ExposureCompensation);
				// don't show focal length for primes
				if (!numericRange.test(this.Lens)) { this.FocalLength = null; }
			}
			this.Software = sanitizeSoftware(this.Software);
			this.sanitized = true;
		}
	}
}

module.exports = EXIF;

// - Private static members ---------------------------------------------------

const numericRange = /\d\-\d/;
const exifSpace = {
	IFD0: 'IFD0',
	IFD1: 'IFD1',
	ExifIFD: 'ExifIFD',
	GPS: 'GPS',
	Photoshop: 'Photoshop',
	IPTC: 'IPTC',
	IccView: 'ICC-view',
	IccMeasure: 'ICC-meas',
	XmpX: 'XMP-x',
	XmpXmp: 'XMP-xmp',
	XmpAux: 'XMP-aux',
	XmpPhotoshop: 'XMP-photoshop',
	XmpMM: 'XMP-xmpMM',
	XmpDC: 'XMP-dc',
	XmpRights: 'XMP-xmpRights',
	XmpIPTC: 'XMP-iptcCore',
	Adobe: 'Adobe'
};

/**
 * @param {String} text
 * @returns {String}
 */
function sanitizeCamera(text) {
	return (is.empty(text)) ? '' : text
		.replace('NIKON', 'Nikon')
		.replace('ILCE-7R', 'Sony ?7?')
		.replace('ILCE-7RM2', 'Sony ?7? II')
		.replace('Sony ?7?M2', 'Sony ?7? II')
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
		.replace(/FE 35mm.*/i, 'Sony FE 35mm �2.8')
		.replace(/FE 55mm.*/i, 'Sony FE 55mm �1.8')
		.replace(/FE 90mm.*/i, 'Sony FE 90mm �2.8 OSS')
		.replace('58.0 mm f/1.4', 'Voigtl�nder Nokton 58mm �1.4 SL II')
		.replace('14.0 mm f/2.8', 'Samyang 14mm �2.8')
		.replace('50.0 mm f/1.4', 'Sigma 50mm �1.4 EX DG')
		.replace('35.0 mm f/2.0', (/D700/.test(camera) ? 'Zeiss Distagon T* 2/35 ZF.2' : 'Nikkor 35mm �2.0D'))
		.replace('100.0 mm f/2.0', 'Zeiss Makro-Planar T* 2/100 ZF.2')
		.replace('150.0 mm f/2.8', 'Sigma 150mm �2.8 EX DG HSM APO')
		.replace('90.0 mm f/2.8', 'Tamron 90mm �2.8 SP AF Di')
		.replace('24.0 mm f/3.5', 'Nikkor PC-E 24mm �3.5D ED')
		.replace('14.0-24.0 mm f/2.8', 'Nikon 14�24mm �2.8G ED')
		.replace('24.0-70.0 mm f/2.8', 'Nikon 24�70mm �2.8G ED')
		.replace('17.0-55.0 mm f/2.8', 'Nikon 17�55mm �2.8G')
		.replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10�20mm �4�5.6 EX DC HSM')
		.replace('1 NIKKOR VR 30-110mm f/3.8-5.6', 'Nikkor 1 30�110mm �3.8�5.6 VR')
		.replace('1 NIKKOR VR 10-30mm f/3.5-5.6', 'Nikkor 1 10�30mm �3.5�5.6 VR')
		.replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18�200mm �3.5�5.6G ED VR')
		.replace(/Voigtlander Heliar 15mm.*/i, 'Voigtl�nder Heliar 15mm �4.5 III');
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