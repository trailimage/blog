'use strict';

const is = require('../../is.js');
const format = require('../../format.js');
const FactoryBase = require('../../models/factory.js');
const PostTag = require('../../models/post-tag.js');
const Photo = require('../../models/photo.js');
const Size = require('../../models/size.js');

/**
 * @extends {FactoryBase}
 */
class FlickrFactory extends FactoryBase {

	/**
	 * Create post from Flickr photo set
	 * @param {Flickr.SetSummary|Object} flickrSet
	 * @param {boolean} [chronological = true] Whether set photos occurred together at a point in time
	 * @return {Post}
	 */
	buildPost(flickrSet, chronological) {
		let p = new Post();

		p.id = flickrSet.id;
		p.chronological = (chronological === undefined) || chronological;
		p.originalTitle = flickrSet.title;

		let parts = p.originalTitle.split(/:\s*/g);

		p.title = parts[0];

		if (parts.length > 1) {
			p.subTitle = parts[1];
			p.seriesSlug = format.slug(p.title);
			p.partSlug = format.slug(p.subTitle);
			p.slug = p.seriesSlug + '/' + p.partSlug;
		} else {
			p.slug = format.slug(p.originalTitle);
		}
		return p;
	};

	/**
	 * Convert Flickr collection into a post tag
	 * @param {Flickr.Collection} collection
	 * @return {PostTag}
	 */
	buildPostTag(collection) {
		let pt = new PostTag();
		pt.title = collection.title;
		pt.slug = format.slug(collection.title);
		pt.icon = PostTag.inferIcon(collection.title);
		pt.tags = [];
		pt.posts = [];
		return pt;
	}

	/**
	 * Parse Flickr photo summary
	 * @param {Flickr.PhotoSummary} s
	 * @param {Object.<String>} sizeField Defined in LibraryProvider
	 * @param {Number} index Position of photo in list
	 * @return {Photo}
	 */
	buildPostPhoto(s, sizeField, index) {
		let p = new Photo();
		let normal = (is.array(sizeField.fallbacks))
			? [sizeField.normal].concat(sizeField.fallbacks)
			: sizeField.normal;

		p.id = s.id;
		p.index = index + 1;
		p.title = s.title;
		p.description = s.description._content;
		p.tags = s.tags.split(' ');
		p.dateTaken = format.parseDate(s.datetaken);
		p.latitude = parseFloat(s.latitude);
		p.longitude = parseFloat(s.longitude);
		p.primary = (parseInt(s.isprimary) == 1);
		p.size.preview = Size.parse(s, sizeField.preview);
		p.size.normal = Size.parse(s, normal);
		p.size.big = Size.parse(s, sizeField.big);
		return p;
	}

	/**
	 * Parse Flickr photo summary used in thumb search
	 * @param {Flickr.PhotoSummary} s
	 * @param {String} sizeField
	 * @return {Photo}
	 */
	buildSearchPhoto(s, sizeField) {
		let p = new Photo();
		p.id = s.id;
		p.size.thumb = Size.parse(s, sizeField);
		return p;
	}

	/**
	 * @param {Flickr.PhotoSummary} s
	 * @param {String|String[]} sizeField Size or list of size field names in order of preference
	 * @return {Size}
	 */
	buildPhotoSize(s, sizeField) {
		let field = null;
		let size = new Size();

		if (is.array(sizeField)) {
			// iterate through size preferences to find first that isn't empty
			for (field of sizeField) {
				// break with given size url assignment if it exists in the photo summary
				if (!is.empty(s[field])) { break; }
			}
		} else {
			field = sizeField;
		}

		if (field !== null) {
			let suffix = field.remove('url');

			if (!is.empty(s[field])) {
				size.url = s[field];
				size.width = parseInt(s['width' + suffix]);
				size.height = parseInt(s['height' + suffix]);
			}
		}
		return size;
	}
}

module.exports = FlickrFactory;