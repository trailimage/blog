'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.LinkData
 */
class LinkDataNamespace {
	static get Action() { return require('./ld-action.js'); }
	static get Article() { return require('./ld-article.js'); }
	static get CreativeWork() { return require('./ld-creative-work.js'); }
	static get DateTime() { return require('./ld-datetime.js'); }
	static get Duration() { return require('./ld-duration.js'); }
	static get Event() { return require('./ld-event.js'); }
	static get Image() { return require('./ld-image.js'); }
	static get NewsArticle() { return require('./ld-news-article.js'); }
	static get Organization() { return require('./ld-organization.js'); }
	static get Person() { return require('./ld-person.js'); }
	static get Photograph() { return require('./ld-photograph.js'); }
	static get Place() { return require('./ld-place.js'); }
	static get Rating() { return require('./ld-rating.js'); }
	static get Review() { return require('./ld-review.js'); }
}

LinkDataNamespace.Base = require('./ld-base.js');

/**
 * @alias TI.LinkData.Type
 * @see @see http://schema.org
 */
LinkDataNamespace.Type = {
	action: 'Action',
	article: 'Article',
	blog: 'Blog',
	comment: 'Comment',
	creativeWork: 'CreativeWork',
	dateTime: 'DateTime',
	duration: 'Duration',
	event: 'Event',
	image: 'ImageObject',
	media: 'MediaObject',
	newsArticle: 'NewsArticle',
	organization: 'Organization',
	person: 'Person',
	photograph: 'Photograph',
	place: 'Place',
	postalAddress: 'PostalAddress',
	product: 'Product',
	rating: 'Rating',
	review: 'Review'
};

module.exports = LinkDataNamespace;