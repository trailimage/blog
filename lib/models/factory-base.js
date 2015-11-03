'use strict';

const is = require('../is.js');

/**
 * Methods to build models from a particular data source
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler#generics
 */
class FactoryBase {
	/**
	 * @param {Object} json
	 * @param {FeatureSet[]} [featureSets] Optional photo sets to feature in the root collection
	 * @return {Library}
	 */
	buildLibrary(json, featureSets) {}

	/**
	 * Create post from Flickr photo set
	 * @param {Object} json
	 * @param {boolean} [chronological = true] Whether set photos occurred together at a point in time
	 * @return {Post}
	 */
	buildPost(json, chronological) {}

	/**
	 * @param {Object} json
	 * @return {Post}
	 */
	buildPostTag(json) {}

	/**
	 * @param {Post} post
	 * @param {Object} json
	 */
	buildPostInfo(post, json) {}

	/**
	 * @param {Post} post
	 * @param {Object} json
	 * @param {String[]} [excludePostIDs]
	 */
	buildAllPostPhotos(post, json, excludePostIDs) {}

	/**
	 * Parse Flickr photo summary
	 * @param {Object} json
	 * @param {Object.<String>} sizeField Defined in LibraryProvider
	 * @param {Number} index Position of photo in list
	 * @return {Photo}
	 */
	buildPostPhoto(json, sizeField, index) {}

	/**
	 * Parse Flickr photo summary used in thumb search
	 * @param {Object} json
	 * @param {String} sizeField
	 * @return {Photo}
	 */
	buildSearchPhoto(json, sizeField) {}

	/**
	 * @param {Object} json
	 * @param {String|String[]} sizeField Size or list of size field names in order of preference
	 * @return {Size}
	 */
	buildPhotoSize(json, sizeField) {}

	/**
	 * @param {Object} flickrTags
	 * @param {String[]} [exclusions]
	 * @return {Object.<String>}
	 */
	buildPhotoTags(flickrTags, exclusions) {}

	/**
	 * @param {Object} json
	 * @return {EXIF}
	 */
	buildExif(json) {}

	/**
	 * Format post description
	 * @param {String} description
	 * @param {Photo[]} photos
	 * @param {Object.<int>} video
	 */
	_buildPostDescription(description, photos, video) {
		if (!is.empty(description)) {
			description = `${description} (Includes ${photos.length} photos`;
			description += (video === null) ? '.)' : ' and one video.)'
		}
		return description;
	}
}

module.exports = FactoryBase;