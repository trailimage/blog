'use strict';

const { thing, Type } = require('./');

// http://schema.org/Event
module.exports = thing.extend(Type.event, {
	attendee: null,
	duration: null,
	location: null,
	organizer: null,
	review: null,
	workFeatured: null,
	workPerformed: null
});