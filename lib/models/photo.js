'use strict';

const format = require('./../format.js');
const setting = require('./../settings.js');
const Enum = require('./../enum.js');

var Photo = function() {
	this.id = null;
	this.title = null;
	this.description = null;
	this.latitude = null;
	this.longitude = null;
};