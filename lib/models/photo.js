'use strict';

var format = require('./../format.js');
var setting = require('./../settings.js');
var Enum = require('./../enum.js');

var Photo = function() {
	this.id = null;
	this.title = null;
	this.description = null;
	this.latitude = null;
	this.longitude = null;
};