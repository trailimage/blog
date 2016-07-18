'use strict';

/**
 * @namespace
 * @alias TI.Mock
 */
class Mock {
	static get Response() { return require('./mock-response.js'); }
}

Mock.Request = require('./mock-request.js');
Mock.PDFDocument = require('./mock-pdfkit.js');

module.exports = Mock;