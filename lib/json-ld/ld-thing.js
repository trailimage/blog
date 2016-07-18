'use strict';

const contextField = '@context';
const typeField = '@type';
const idField = '@id';

// http://schema.org/Thing
module.exports = {
	[typeField]: null,
	[contextField]: 'http://schema.org',
	[idField]: null,
	name: null,
	description: null,
	image: null,
	alternateName: null,
	additionalType: null,
	potentialAction: null,
	url: null,

   // convert link data to string with nulls and zeroes removed
	serialize() {
		removeContext(this, null);
		return JSON.stringify(flatten(this), (key, value) => (value === null || value === 0) ? undefined : value);
	},

   copy() { return Object.assign({}, this); },

   // create new object of given type with additional fields
   extend(type, newFields = {}) {
      return Object.assign({}, this, newFields, { [typeField]: type });
   },

	get id() { return this[idField]; },
	set id(value) { this[idField] = value; },

	get context() { return this[contextField]; },
	set context(value) { this[contextField] = value; },

	get type() { return this[typeField]; },
	set type(value) { this[typeField] = value; }
};

// remove redundant context specifications
function removeContext(o, context) {
	if (o !== undefined && o !== null && typeof(o) == 'object') {
		if (o.hasOwnProperty(contextField) && o[contextField] !== null) {
			if (o[contextField] == context) {
				// remove redundant value
				delete o[contextField];
			} else {
				// switch to new context
				context = o[contextField];
			}
		}
		for (let field in o) { removeContext(o[field], context); }
	}
}

// flatten prototypical members to become own for sake of serialization
function flatten(o) {
	let flat = Object.create(o);
	for (let key in flat) { flat[key] = flat[key]; }
	return flat;
}