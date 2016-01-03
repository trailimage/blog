'use strict';

class ModelFactory {
	/**
	 * @param {function(Library)} callback
	 */
	static load(callback) {
		if (Library.current !== null) {
			callback(Library.current);
		} else {
			db.photo.loadLibrary(library => {
				Library.current = library;
				callback(library);
			});
		}
	};

	/**
	 * Ensure photos and information are loaded for all posts
	 * @param {Provider.Photo.Base} db
	 * @param {Function} callback Method to call when all posts are fully loaded
	 */
	ensureLoaded(db, callback) {
		let pending = this.posts.length;

		for (let p of this.posts) {
			db.loadPost(p, post => { if (--pending <= 0) { callback(); } });
		}
	};
}