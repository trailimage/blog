'use strict';

const { creativeWork, list, Type } = require('./');

// http://schema.org/WebPage
module.exports = creativeWork.extend(Type.webPage, {
	significantLink: null,
	primaryImageOfPage: null,
	reviewedBy: null,
	relatedLink: null,
   // http://schema.org/Specialty
	specialty: null,
	breadcrumb: null,
	mainContentOfPage: null,
   addBreadcrumb(b) {
		if (this.breadcrumb === null) { this.breadcrumb = list.extend('BreadcrumbList'); }
		this.breadcrumb.add(b);
	}
});