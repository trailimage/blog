'use strict';

const Enum = require('../enum.js');
const setting = require('../settings.js');

exports.view = (req, res) => {
	res.redirect(Enum.httpStatus.permanentRedirect, 'http://issues.' + setting.domain);
};