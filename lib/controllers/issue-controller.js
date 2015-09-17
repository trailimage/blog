'use strict';

var Enum = require('../enum.js');
var setting = require('../settings.js');

exports.view = (req, res) => {
	res.redirect(Enum.httpStatus.permanentRedirect, 'http://issues.' + setting.domain);
};