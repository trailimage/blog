"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const post_1 = require("./post");
const text_1 = require("../util/text");
const config_1 = require("../config");
const library_1 = require("../library");
function getSubcategory(key) {
    return this.subcategories.find(c => c.title === key || c.key === key);
}
function has(key) {
    return this.getSubcategory(key) !== undefined;
}
function add(subcat) {
    if (is_1.default.value(subcat)) {
        const oldKey = subcat.key;
        subcat.key = this.key + '/' + subcat.key;
        this.subcategories.push(subcat);
        for (const p of subcat.posts) {
            delete p.categories[oldKey];
            p.categories[subcat.key] = subcat.title;
        }
    }
}
function removePost(post) {
    const index = this.posts.indexOf(post);
    if (index >= 0) {
        this.posts.splice(index, 1);
    }
    this.subcategories.forEach(s => { s.removePost(post); });
    return this;
}
function ensureLoaded() {
    return Promise.all(this.posts.map(p => p.getInfo().then(p => p.getPhotos())));
}
function make(collection, root = false) {
    let exclude = config_1.default.flickr.excludeSets;
    const feature = config_1.default.flickr.featureSets;
    const category = {
        title: collection.title,
        key: text_1.slug(collection.title),
        subcategories: [],
        posts: [],
        get isChild() { return this.key.includes('/'); },
        get isParent() { return this.subcategories.length > 0; },
        add,
        getSubcategory,
        has,
        removePost,
        ensureLoaded
    };
    let p = null;
    if (exclude === undefined) {
        exclude = [];
    }
    if (root) {
        library_1.default.categories[category.title] = category;
    }
    if (is_1.default.array(collection.set) && collection.set.length > 0) {
        for (const s of collection.set) {
            if (exclude.indexOf(s.id) == -1) {
                p = library_1.default.postWithID(s.id);
                if (!is_1.default.value(p)) {
                    p = post_1.default.make(s);
                }
                category.posts.push(p);
                p.categories[category.key] = category.title;
                library_1.default.addPost(p);
            }
        }
    }
    if (is_1.default.array(collection.collection)) {
        collection.collection.forEach(c => { category.add(make(c)); });
    }
    if (root && is_1.default.array(feature)) {
        for (const f of feature) {
            const p = post_1.default.make(f, false);
            p.feature = true;
            library_1.default.addPost(p);
        }
    }
    return category;
}
exports.default = { make };
//# sourceMappingURL=category.js.map