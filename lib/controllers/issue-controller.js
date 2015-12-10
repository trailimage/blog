'use strict';

const TI = require('../');

exports.view = (req, res) => {
	res.redirect(TI.httpStatus.permanentRedirect, 'http://issues.' + TI.config.domain);
};