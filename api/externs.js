'use strict';

let FlickrOptions = {};
/**
 * @param {Flickr.Response} r
 */
FlickrOptions.prototype.value = function(r) {};
/** @type {Boolean} */
FlickrOptions.prototype.sign = false;
/** @type {String} */
FlickrOptions.prototype.error = null;
/** @type {Object} */
FlickrOptions.prototype.args = {};

let Categories = {};


let Size = {};
/** @type {String} */
Size.prototype.url = null;
/** @type {Number} */
Size.prototype.width = 0;
/** @type {Number} */
Size.prototype.height = 0;
/** @type {Boolean} */
Size.prototype.empty = false;

let Photo = {};
/** @type {String} */
Photo.prototype.id = null;
/** @type {Nunber} */
Photo.prototype.index = 0;
/** @type {String} */
Photo.prototype.sourceUrl = null;
/** @type {String} */
Photo.prototype.title = null;
/** @type {String} */
Photo.prototype.description = null;
/** @type {String[]} */
Photo.prototype.tags = [];
/** @type {Date} */
Photo.prototype.dateTaken = null;
/** @type {Number} */
Photo.prototype.latitude = 0.0;
/** @type {Number} */
Photo.prototype.longitude = 0.0;
/** @type {Boolean} */
Photo.prototype.primary = false;
/** @type {Object.<Size>} */
Photo.prototype.size = {};
/** @type {Size} */
Photo.size.prototype.preview = null;
/** @type {Size} */
Photo.size.prototype.normal = null;
/** @type {Size} */
Photo.size.prototype.big = null;
//
// id: json.id,
//    index: index + 1,
//    sourceUrl: linkBase + json.pathalias + '/' + json.id,
//    title: json.title,
//    description: json.description._content,
//    // tag slugs are later updated to proper names
//    tags: is.empty(json.tags) ? [] : json.tags.split(' '),
//    dateTaken: format.parseDate(json.datetaken),
//    latitude: parseFloat(json.latitude),
//    longitude: parseFloat(json.longitude),
//    primary: (parseInt(json.isprimary) == 1),
//    // whether taken date is an outlier compared to other photos in the same post
//    // http://www.wikihow.com/Calculate-Outliers
//    outlierDate: false,
//    size: {
//    preview: buildPhotoSize(json, this.sizeField.preview),
//       normal: buildPhotoSize(json, this.sizeField.normal),
//       big: buildPhotoSize(json, this.sizeField.big)
// },
// // comma-delimited list of tags
// get tagList() { return this.tags.toString(','); }



let Post = {};
/** @type {String} */
Post.prototype.id = null;
/** @type {Boolean} */
Post.prototype.chronological = true;
/** @type {String} */
Post.prototype.originalTitle = null;
/** @type {Boolean} */
Post.prototype.photosLoaded = false;
/** @type {Photo[]} */
Post.prototype.photos = [];
/** @type {Number} */
Post.prototype.photoCount = 0;
/** @type {Photo} */
Post.prototype.coverPhoto = null;
/** @type {Boolean} */
Post.prototype.feature = false;
/** @type {Object.<Category>} */
Post.prototype.categories = {};
/** @type {Boolean} */
Post.prototype.hasCategories = true;
/** @type {Boolean} */
Post.prototype.infoLoaded = false;
/** @type {Boolean} */
Post.prototype.triedTrack = false;
/** @type {Boolean} */
Post.prototype.hasTrack = null;
/** @type {Post} */
Post.prototype.next = null;
/** @type {Post} */
Post.prototype.previous = null
/** @type {Number} */
Post.prototype.part = 0;
/** @type {Boolean} */
Post.prototype.isPartial = false;
/** @type {Boolean} */
Post.prototype.nextIsPart = false;
/** @type {Boolean} */
Post.prototype.previousIsPart = false;
/** @type {Number} */
Post.prototype.totalParts = 0;
/** @type {Boolean} */
Post.prototype.isSeriesStart = false;
/** @type {String} */
Post.prototype.photoCoordinates = null;

Post.prototype.makeSeriesStart = function() {};
Post.prototype.ungroup = function() {};
Post.prototype.addPhotos = function(list) {};



//
//    // position of this post in a series
//    part: 0,
//    // whether post is part of a series
//    isPartial: false,
//    // whether next post is part of the same series
//    nextIsPart: false,
//    // whether previous post is part of the same series
//    previousIsPart: false,
//    // total number of posts in series, if any
//    totalParts: 0,
//    // whether this post begins a series
//    isSeriesStart: false,
//
//    makeSeriesStart,
//    ungroup: ungroupPost,
//
//    //addPhotos(list) { addPostPhotos(this, list); },
//    name: postName,
//    removeDetails() { removePostInfo(this); },
// addPhotos: addPostPhotos