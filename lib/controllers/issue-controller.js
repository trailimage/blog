'use strict';

const Enum = require('../enum.js');
const config = require('../config.js');

exports.view = (req, res) => {
	res.redirect(Enum.httpStatus.permanentRedirect, 'http://issues.' + config.domain);
};