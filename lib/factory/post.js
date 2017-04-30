"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const is_1 = require("../is");
const regex_1 = require("../regex");
const logger_1 = require("../logger");
const config_1 = require("../config");
const photo_js_1 = require("./photo.js");
const video_info_1 = require("./video-info");
const library_1 = require("../library");
const flickr_1 = require("../providers/flickr");
let flickr = flickr_1.default;
function ungroup() {
    this.title = this.originalTitle;
    this.subTitle = null;
    this.key = util_1.default.slug(this.originalTitle);
    this.part = 0;
    this.totalParts = 0;
    this.isSeriesStart = false;
    this.isPartial = false;
    this.nextIsPart = false;
    this.previousIsPart = false;
    this.seriesKey = null;
    this.partKey = null;
}
function makeSeriesStart() {
    this.isSeriesStart = true;
    this.key = this.seriesKey;
}
function hasKey(key) {
    return (this.key == key || (is_1.default.value(this.partKey) && key == this.seriesKey + '-' + this.partKey));
}
function ensureLoaded() { return Promise.all([this.getInfo(), this.getPhotos()]); }
function getPhotos() {
    return this.photosLoaded
        ? Promise.resolve(this.photos)
        : flickr.getSetPhotos(this.id).then((res) => updatePhotos(this, res));
}
function getInfo() {
    return this.infoLoaded
        ? Promise.resolve(this)
        : flickr.getSetInfo(this.id).then((info) => updateInfo(this, info));
}
function updateInfo(p, setInfo) {
    const thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;
    return Object.assign(p, {
        video: video_info_1.default.make(setInfo),
        createdOn: util_1.default.date.fromTimeStamp(setInfo.date_create),
        updatedOn: util_1.default.date.fromTimeStamp(setInfo.date_update),
        photoCount: setInfo.photos,
        description: setInfo.description._content.replace(/[\r\n\s]*$/, ''),
        longDescription: p.description,
        bigThumbURL: thumb + '.jpg',
        smallThumbURL: thumb + '_s.jpg',
        infoLoaded: true
    });
}
function updatePhotos(p, setPhotos) {
    p.photos = setPhotos.photo.map((img, index) => photo_js_1.default.make(img, index));
    if (p.photos.length > 0) {
        p.coverPhoto = p.photos.find(img => img.primary);
        if (!is_1.default.value(p.coverPhoto)) {
            logger_1.default.error('No cover photo defined for %s', p.title);
            p.coverPhoto = p.photos[0];
        }
        p.photoTagList = library_1.default.photoTagList(p.photos);
        if (p.chronological) {
            photo_js_1.default.identifyOutliers(p.photos);
            const firstDatedPhoto = p.photos.find(i => !i.outlierDate);
            if (is_1.default.value(firstDatedPhoto)) {
                p.happenedOn = firstDatedPhoto.dateTaken;
            }
        }
        if (!is_1.default.empty(p.description)) {
            p.longDescription = `${p.description} (Includes ${p.photos.length} photos`;
            p.longDescription += (is_1.default.value(p.video) && !p.video.empty) ? ' and one video)' : ')';
        }
        p.updatePhotoMarkers();
    }
    p.photosLoaded = true;
    return p.photos;
}
function empty() {
    this.video = null;
    this.createdOn = null;
    this.updatedOn = null;
    this.photoCount = 0;
    this.description = null;
    this.coverPhoto = null;
    this.bigThumbURL = null;
    this.smallThumbURL = null;
    this.infoLoaded = false;
    this.triedTrack = false;
    this.photos = null;
    this.happenedOn = null;
    this.photoTagList = null;
    this.photoMarkers = null;
    this.longDescription = null;
    this.photosLoaded = false;
}
function name() {
    const p = this.post ? this.post : this;
    return p.title + ((p.isPartial) ? config_1.default.library.subtitleSeparator + ' ' + p.subTitle : '');
}
function updatePhotoMarkers() {
    let start = 1;
    let total = this.photos.length;
    let markers = '';
    if (total > config_1.default.map.maxMarkers) {
        start = 5;
        total = config_1.default.map.maxMarkers + 5;
        if (total > this.photos.length) {
            total = this.photos.length;
        }
    }
    for (let i = start; i < total; i++) {
        const img = this.photos[i];
        if (img.latitude > 0) {
            markers += `,url-${encodeURIComponent('http://www.trailimage.com/p.png')}(${img.longitude.toFixed(5)},${img.latitude.toFixed(5)})`;
        }
    }
    this.photoMarkers = (is_1.default.empty(markers)) ? null : markers.replace(/^,/, '');
}
function make(flickrSet, chronological = true) {
    const p = {
        key: null,
        title: null,
        subTitle: null,
        description: null,
        longDescription: null,
        id: flickrSet.id,
        chronological,
        originalTitle: flickrSet.title,
        photosLoaded: false,
        photos: [],
        photoCount: 0,
        photoTagList: null,
        coverPhoto: null,
        updatedOn: null,
        createdOn: null,
        happenedOn: null,
        bigThumbURL: null,
        smallThumbURL: null,
        feature: false,
        categories: {},
        get hasCategories() { return Object.keys(this.categories).length > 0; },
        video: null,
        infoLoaded: false,
        triedTrack: false,
        hasTrack: false,
        next: null,
        previous: null,
        part: 0,
        isPartial: false,
        nextIsPart: false,
        previousIsPart: false,
        totalParts: 0,
        isSeriesStart: false,
        photoMarkers: null,
        makeSeriesStart,
        ungroup,
        name,
        empty,
        ensureLoaded,
        getInfo,
        getPhotos,
        hasKey,
        updatePhotoMarkers
    };
    const parts = p.originalTitle.split(regex_1.default.subtitle);
    p.title = parts[0];
    if (parts.length > 1) {
        p.subTitle = parts[1];
        p.seriesKey = util_1.default.slug(p.title);
        p.partKey = util_1.default.slug(p.subTitle);
        p.key = p.seriesKey + '/' + p.partKey;
    }
    else {
        p.key = util_1.default.slug(p.originalTitle);
    }
    return p;
}
exports.default = {
    make,
    inject: {
        set flickr(f) { flickr = f; }
    }
};
//# sourceMappingURL=post.js.map