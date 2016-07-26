'use strict';

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

//
// Post.prototype.
//
//    id: flickrSet.id,
//    // whether post pictures occurred at a specific point in time (exceptions are themed sets)
//    chronological: chronological,
//    // to restore subtitle to title if ungrouped
//    originalTitle: flickrSet.title,
//
//    // photos are lazy loaded
//    photosLoaded: false,
//    photos: [],
//    photoCount: 0,
//    coverPhoto: null,
//
//    // whether posts is featured in main navigation
//    feature: false,
//    categories: {},
// // whether post has tags
// get hasCategories() { return Object.keys(this.categories).length > 0; },
//
// infoLoaded: false,
//
//    // whether an attempt has been made to load GPS track
//    triedTrack: false,
//    // whether a GPS track was found
//    hasTrack: false,
//
//    next: null,
//    previous: null,
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