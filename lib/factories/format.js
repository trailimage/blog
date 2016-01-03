'use strict';

class FormatFactory {
	helpers = {
		formatCaption  : text => exports.story(text),
		formatTitle    : text => exports.typography(text),
		lowerCase      : text => text.toLocaleLowerCase(),
		add            : (a, b) => (a * 1) + b,
		date           : d => exports.date(d),
		subtract       : (a, b) => (a * 1) - b,
		plural         : count => (count > 1) ? 's' : '', //makeSlug: text => exports.slug(text),
		makeTagList    : list => exports.tagList(list),
		formatLogTime  : text => exports.logTime(text),
		/** @type {Date} d */
		formatISO8601  : d => d.toISOString(),
		formatFraction : text => exports.fraction(text),
		mapHeight      : (width, height) => height > width ? config.style.map.maxInlineHeight : height,
		icon           : name => exports.icon(name),
		iconForPostTag : title => exports.postTagIcon(title),
		modeIconForPost: tags => exports.postModeIcon(tags),
		rot13          : text => exports.rot13(text),
		encode         : text => encodeURIComponent(text)
	};
}

module.exports = FormatFactory;