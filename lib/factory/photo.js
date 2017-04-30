"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const util_1 = require("../util");
const config_1 = require("../config");
const photo_size_1 = require("./photo-size");
const flickr_1 = require("../providers/flickr");
let flickr = flickr_1.default;
function make(json, index) {
    return {
        id: json.id,
        index: index + 1,
        sourceUrl: 'flickr.com/photos/' + json.pathalias + '/' + json.id,
        title: json.title,
        description: json.description._content,
        tags: is_1.default.empty(json.tags) ? [] : json.tags.split(' '),
        dateTaken: util_1.default.date.parse(json.datetaken),
        latitude: parseFloat(json.latitude),
        longitude: parseFloat(json.longitude),
        primary: (parseInt(json.isprimary) == 1),
        outlierDate: false,
        size: {
            preview: photo_size_1.default.make(json, config_1.default.flickr.sizes.preview),
            normal: photo_size_1.default.make(json, config_1.default.flickr.sizes.normal),
            big: photo_size_1.default.make(json, config_1.default.flickr.sizes.big)
        },
        get tagList() { return this.tags.join(','); }
    };
}
function identifyOutliers(photos) {
    const median = (values) => {
        const half = Math.floor(values.length / 2);
        return (values.length % 2 !== 0) ? values[half] : (values[half - 1] + values[half]) / 2.0;
    };
    const boundary = (values, distance) => {
        if (!is_1.default.array(values) || values.length === 0) {
            return null;
        }
        if (distance === undefined) {
            distance = 3;
        }
        values.sort((d1, d2) => d1 - d2);
        const half = Math.floor(values.length / 2);
        const q1 = median(values.slice(0, half));
        const q3 = median(values.slice(half));
        const range = q3 - q1;
        return {
            min: q1 - (range * distance),
            max: q3 + (range * distance)
        };
    };
    const fence = boundary(photos.map(p => p.dateTaken.getTime()));
    if (fence !== null) {
        for (const p of photos) {
            const d = p.dateTaken.getTime();
            if (d > fence.max || d < fence.min) {
                p.outlierDate = true;
            }
        }
    }
}
exports.default = {
    make,
    identifyOutliers,
    inject: {
        set flickr(f) { flickr = f; }
    }
};
//# sourceMappingURL=photo.js.map