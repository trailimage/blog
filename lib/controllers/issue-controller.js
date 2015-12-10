'use strict';

const lib = require('../');

exports.view = (req, res) => {
	res.redirect(lib.enum.httpStatus.permanentRedirect, 'http://issues.' + lib.config.domain);
};