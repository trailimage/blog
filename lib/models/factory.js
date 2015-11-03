'use strict';

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
	 * @param {Object} json
	 * @return {EXIF}
	 */
	buildExif(json) {}
}

module.exports = FactoryBase;