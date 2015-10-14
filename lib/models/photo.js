'use strict';

const format = require('./../format.js');
const setting = require('./../settings.js');
const Enum = require('./../enum.js');

class Photo {
	constructor() {
		this.id = null;
		this.title = null;
		this.description = null;
		this.latitude = null;
		this.longitude = null;
	}
}