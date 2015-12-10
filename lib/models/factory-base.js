'use strict';

const TI = require('../');
const is = TI.is;
const Library = TI.Library;

/**
 * Methods to build models from a particular data source
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler#generics
 */
class FactoryBase {
	constructor() {
		/**
		 * Provider-specific object field names that store photos sizes
		 * Value may be an array of sizes which will cause the first available size to be shown
		 * @type {Object.<String|String[]>}
		 */
		this.sizeField = {
			thumb: null,
			preview: null,
			normal: null,
			big: null
		};
	}

	/**
	 * @returns {String[]}
	 */
	get sizesForPost() {
		return [].concat(this.sizeField.preview, this.sizeField.normal, this.sizeField.big);
	}

	/**
	 * @returns {String[]}
	 */
	get sizesForMap() {
		return [this.sizeField.preview];
	}

	/**
	 * @returns {String[]}
	 */
	get sizesForSearch() {
		return [this.sizeField.thumb];
	}

	/**
	 * @param {Object} json Source data
	 * @param {FeatureSet[]} [featureSets] Optional photo sets to feature in the root collection
	 * @param {String[]} [excludeSets] Set IDs to exlude from library
	 * @return {Library}
	 */
	buildLibrary(json, featureSets, excludeSets) {
		/** @type {Library} */
		let library = null;

		if (is.value(Library.current)) {
			// refresh current instance
			library = Library.current;
			library.empty();
		} else {
			// create new instance
			library = new Library();
		}
		library = this._buildLibrary(library, json, featureSets, excludeSets);
		library.correlatePosts();

		return library;
	}

	/**
	 * Override with methods to build library from particular source
	 * @param {Library} library New or existing library
	 * @param {Object} json
	 * @param {FeatureSet[]} [featureSets] Optional photo sets to feature in the root collection
	 * @param {String[]} [excludeSets] Set IDs to exlude from library
	 * @return {Library}
	 */
	_buildLibrary(library, json, featureSets, excludeSets) { return library; }

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
	 */
	buildAllPostPhotos(post, json) {}

	/**
	 * Parse Flickr photo summary
	 * @param {Object} json
	 * @param {Number} index Position of photo in list
	 * @return {Photo}
	 */
	buildPostPhoto(json, index) {}

	/**
	 * Parse Flickr photo summary used in thumb search
	 * @param {Object} json
	 * @param {String|String[]} sizeField
	 * @return {Photo}
	 */
	buildSearchPhoto(json, sizeField) {}

	/**
	 * @param {Object} json
	 * @param {String|String[]} sizeField Size or list of size field names in order of preference
	 * @return {PhotoSize}
	 */
	buildPhotoSize(json, sizeField) {}

	/**
	 * @param {Object} flickrTags
	 * @param {String[]} [exclusions]
	 * @return {Object.<String>}
	 */
	buildPhotoTags(flickrTags, exclusions) {}

	/**
	 * Get video ID and dimensions
	 * @param {Object} json
	 * @return {Video}
	 */
	buildVideoInfo(json) {}

	/**
	 * @param {Object} json
	 * @return {EXIF}
	 */
	buildExif(json) {}
}

module.exports = FactoryBase;