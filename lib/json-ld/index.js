'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.LinkData
 */
class LinkDataNamespace {


}

/**
 * @constructor
 */
LinkDataNamespace.Base = require('./ld-base.js');

/**
 * @alias TI.LinkData.Type
 * @see @see http://schema.org
 */
LinkDataNamespace.Type = {
	action: 'Action',
	article: 'Article',
	blog: 'Blog',
	event: 'Event',
	person: 'Person',
	place: 'Place',
	product: 'Product'
};

module.exports = LinkDataNamespace;