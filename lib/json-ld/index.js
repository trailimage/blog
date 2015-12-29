'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.LinkData
 */
class LinkDataNamespace {
	static get Action() { return require('./ld-action.js'); }
	static get AdminArea() { return require('./ld-admin-area.js'); }
	static get AggregateRating() { return require('./ld-aggregate-rating.js'); }
	static get Application() { return require('./ld-application.js'); }
	static get Article() { return require('./ld-article.js'); }
	static get Audience() { return require('./ld-audience.js'); }
	static get Blog() { return require('./ld-blog.js'); }
	static get BlogPost() { return require('./ld-blog-post.js'); }
	static get Coordinates() { return require('./ld-coordinates.js'); }
	static get CreativeWork() { return require('./ld-creative-work.js'); }
	static get DateTime() { return require('./ld-datetime.js'); }
	static get DeliveryMethod() { return require('./ld-delivery-method.js'); }
	static get Demand() { return require('./ld-demand.js'); }
	static get Duration() { return require('./ld-duration.js'); }
	static get EntryPoint() { return require('./ld-entry-point.js'); }
	static get Event() { return require('./ld-event.js'); }
	static get Factory() { return require('./ld-factory.js'); }
	static get Image() { return require('./ld-image.js'); }
	static get List() { return require('./ld-list.js'); }
	static get ListItem() { return require('./ld-item.js'); }
	static get Media() { return require('./ld-media.js'); }
	static get NewsArticle() { return require('./ld-news-article.js'); }
	static get Organization() { return require('./ld-organization.js'); }
	static get Ownership() { return require('./ld-ownership.js'); }
	static get Person() { return require('./ld-person.js'); }
	static get Photograph() { return require('./ld-photograph.js'); }
	static get Place() { return require('./ld-place.js'); }
	static get Post() { return require('./ld-post.js'); }
	static get Product() { return require('./ld-product.js'); }
	static get ProductModel() { return require('./ld-product-model.js'); }
	static get Rating() { return require('./ld-rating.js'); }
	static get Review() { return require('./ld-review.js'); }
	static get SearchAction() { return require('./ld-search-action.js'); }
	static get Service() { return require('./ld-service.js'); }
	static get Shape() { return require('./ld-shape.js'); }
	static get Video() { return require('./ld-video.js'); }
	static get WebPage() { return require('./ld-web-page.js'); }
	static get WebSite() { return require('./ld-web-site.js'); }
}

LinkDataNamespace.Thing = require('./ld-thing.js');
LinkDataNamespace.Music = require('./music/');

/**
 * @alias TI.LinkData.Type
 * @see @see http://schema.org
 */
LinkDataNamespace.Type = {
	action: 'Action',
	administrativeArea: 'AdministrativeArea',
	aggregateRating: 'AggregateRating',
	application: 'SoftwareApplication',
	article: 'Article',
	audience: 'Audience',
	blog: 'Blog',
	blogPost: 'BlogPosting',
	brand: 'Brand',
	comment: 'Comment',
	coordinates: 'GeoCoordinates',
	creativeWork: 'CreativeWork',
	dateTime: 'DateTime',
	deliveryMethod: 'DeliveryMethod',
	demand: 'Demand',
	duration: 'Duration',
	entryPoint: 'EntryPoint',
	event: 'Event',
	image: 'ImageObject',
	list: 'ItemList',
	listItem: 'ListItem',
	media: 'MediaObject',
	newsArticle: 'NewsArticle',
	organization: 'Organization',
	ownership: 'OwnershipInfo',
	person: 'Person',
	photograph: 'Photograph',
	place: 'Place',
	post: 'SocialMediaPosting',
	postalAddress: 'PostalAddress',
	product: 'Product',
	productModel: 'ProductModel',
	rating: 'Rating',
	review: 'Review',
	searchAction: 'SearchAction',
	service: 'Service',
	shape: 'GeoShape',
	thing: 'Thing',
	video: 'VideoObject',
	webPage: 'WebPage',
	webSite: 'WebSite'
};

module.exports = LinkDataNamespace;