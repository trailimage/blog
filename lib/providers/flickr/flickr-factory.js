'use strict';

const is = require('../../is.js');
const re = require('../../regex.js');
const format = require('../../format.js');
const FactoryBase = require('../../models/factory-base.js');
const Library = require('../../models/library.js');
const Post = require('../../models/post.js');
const PostTag = require('../../models/post-tag.js');
const Photo = require('../../models/photo.js');
const Size = require('../../models/size.js');
const EXIF = require('../../models/exif.js');

/**
 * @extends {FactoryBase}
 */
class FlickrFactory extends FactoryBase {

	/**
	 * @param {Flickr.Tree|Object|T} flickrTree
	 * @param {FeatureSet[]} [featureSets] Optional photo sets to feature in the root collection
	 * @return {Library}
	 */
	buildLibrary(flickrTree, featureSets) {
		let library = new Library();
		for (let c of flickrTree.collection) { this._addCollection(library, c, true, featureSets); }
		library.correlatePosts();
		return library;
	}

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
	 * @param {Post} post
	 * @param {Flickr.SetInfo} setInfo
	 */
	buildPostInfo(post, setInfo) {
		const lineBreak = /[\r\n]/g;

		post.video = parseVideoMetadata(setInfo);      // may also update info.description
		post.createdOn = format.parseTimeStamp(setInfo.date_create);
		post.updatedOn = format.parseTimeStamp(setInfo.date_update);
		post.photoCount = setInfo.photos;
		post.description = this.longDescription = setInfo.description._content.remove(lineBreak);
		// http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
		// http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
		let thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;

		post.bigThumb = thumb + '.jpg';     // 500px
		post.smallThumb = thumb + '_s.jpg';
		post.infoLoaded = true;
	}

	/**
	 * @param {Post} post
	 * @param {Flickr.SetPhotos} setPhotos
	 */
	buildAllPostPhotos(post, setPhotos) {
		let library = require('../../models/library.js').current;

		post.photos = setPhotos.photo.map((p, index) => this.buildPostPhoto(p, this.sizeField, index));
		post.photoTagList = library.photoTagList(post.photos);
		post.thumb = post.photos.find(p => p.primary);

		if (!is.array(this.options.excludeSets) || this.options.excludeSets.indexOf(post.id) == -1) {
			post.photoCoordinates = Photo.coordinateList(post.photos);
			post.dateTaken = Photo.getDateTaken(post.photos);
			post.longDescription = updateDescription(post.description, post.photos, post.video);
		}
		post.photosLoaded = true;
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

	/**
	 * @param {Flickr.TagSummary[]} flickrTags
	 * @param {String[]} [exclusions]
	 * @return {Object.<String>}
	 */
	buildPhotoTags(flickrTags, exclusions) {
		if (exclusions === undefined) { exclusions = []; }
		/** @type {Object.<String>} */
		let tags = {};

		for (let t of flickrTags) {
			let text = t.raw[0]._content;

			if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) {
				// not a machine tag and not a tag to be removed
				tags[t.clean] = text;
			}
		}
		return tags;
	}

	/**
	 * @param {Flickr.Exif[]} xf
	 * @return {EXIF}
	 */
	buildExif(xf) {
		let exif = new EXIF();

		exif.populate(xf, (exif, tag) => {
			for (let e of exif) { if (e.tag == tag) { return e.raw._content; } }
			return null;
		});

		exif.sanitize();

		return exif;
	}

	/**
	 * Add Flickr collection to the tree
	 * @param {Library} library
	 * @param {Flickr.Collection} collection
	 * @param {Boolean} [root = false]
	 * @param {FeatureSet[]} [featureSets]
	 * @return {PostTag}
	 * @private
	 */
	_addCollection(library, collection, root, featureSets) {
		let t = this.buildPostTag(collection);
		/** @type {Post} */
		let p = null;

		if (root === undefined) { root = false; }
		if (root) { library.tags[t.title] = t; }

		if (is.array(collection.set) && collection.set.length > 0) {
			// tag contains one or more posts
			for (let s of collection.set) {
				// see if post is already present in the library
				p = library.postWithID(s.id);

				// create item object if it isn't part of an already added group
				if (p === null) { p = this.buildPost(s); }

				p.addTag(t.title);
				t.posts.push(p);        // add post to tag
				library.addPost(p);     // add post to library
			}
		}

		if (collection.collection) {
			// recursively add child tags
			collection.collection.forEach(c => { t.tags.push(this._addCollection(library, c)) });
		}

		if (root && is.array(featureSets)) {
			// sets to feature at the collection root can be manually defined in provider options
			for (let f of featureSets) {
				library.addPost(this.buildPost(f, false));
			}
		}
		return t;
	}

}

module.exports = FlickrFactory;

// - Private static methods ---------------------------------------------------

/**
 * Get YouTube ID and dimensions for video link
 * @param {Flickr.SetInfo} setInfo
 */
function parseVideoMetadata(setInfo) {
	let video = null;
	/** @type {String} */
	let d = setInfo.description._content;

	if (re.video.test(d))	{
		let match = re.video.exec(d);
		video = { id: match[4], width: match[2], height: match[3] };
		// remove video link from description
		setInfo.description._content = d.remove(match[0]).remove(/[\r\n\s]*$/);
	}
	return video;
}

/**
 * Format set description
 * @param {String} description
 * @param {Photo[]} photos
 * @param {Object.<int>} video
 */
function updateDescription(description, photos, video) {
	if (!is.empty(description)) {
		description = `${description} (Includes ${photos.length} photos`;
		description += (video === null) ? '.)' : ' and one video.)'
	}
	return description;
}