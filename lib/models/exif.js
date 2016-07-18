'use strict';

const TI = require('../');
const is = TI.is;
const re = TI.re;

/**
 * @alias TI.Exif
 */
class EXIF {
	constructor() {
		/** @type String */
		this.artist = null;
		/** @type String */
		this.compensation = null;
		this.time = 0;
		this.fNumber = 0;
		this.focalLength = 0;
		this.ISO = 0;
		/** @type String */
		this.lens = null;
		/** @type String */
		this.model = null;
		/** @type String */
		this.software = null;
		/** @type Boolean */
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

