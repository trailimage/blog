"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("./is");
exports.default = {
    categories: {},
    posts: [],
    tags: {},
    loaded: false,
    postInfoLoaded: false,
    changedKeys: [],
    empty() {
        this.loaded = false;
        this.postInfoLoaded = false;
        this.posts = [];
        this.categories = {};
        this.tags = {};
        return this;
    },
    addPost(p) {
        if (this.posts.filter(e => e.id === p.id).length > 0) {
            return;
        }
        this.posts.push(p);
        if (p.chronological && this.posts.length > 1) {
            const next = this.posts[this.posts.length - 2];
            if (next.chronological) {
                p.next = next;
                next.previous = p;
            }
        }
    },
    postKeys() { return this.posts.map(p => p.key); },
    categoryKeys(filterList = []) {
        const keys = [];
        if (filterList.length > 0) {
            if (!is_1.default.array(filterList)) {
                filterList = [filterList];
            }
            for (const filterName of filterList) {
                for (const name in this.categories) {
                    const category = this.categories[name];
                    const subcat = category.getSubcategory(filterName);
                    if (name == filterName) {
                        keys.push(category.key);
                    }
                    else if (is_1.default.value(subcat)) {
                        keys.push(subcat.key);
                    }
                }
            }
        }
        else {
            for (const name in this.categories) {
                const category = this.categories[name];
                keys.push(category.key);
                category.subcategories.forEach(s => { keys.push(s.key); });
            }
        }
        return keys;
    },
    categoryWithKey(key) {
        const rootKey = (key.includes('/')) ? key.split('/')[0] : key;
        for (const name in this.categories) {
            const cat = this.categories[name];
            if (cat.key == rootKey) {
                return (key != rootKey) ? cat.getSubcategory(key) : cat;
            }
        }
        return null;
    },
    getPhotos() {
        return Promise
            .all(this.posts.map(p => p.getPhotos()))
            .then(photos => photos.reduce((all, p) => all.concat(p), []));
    },
    postWithID(id) { return this.posts.find(p => p.id == id); },
    postWithKey(key, partKey = null) {
        if (is_1.default.value(partKey)) {
            key += '/' + partKey;
        }
        return this.posts.find(p => p.hasKey(key));
    },
    unload(keys) {
        if (!is_1.default.array(keys)) {
            keys = [keys];
        }
        for (const k of keys) {
            const p = this.postWithKey(k);
            if (is_1.default.value(p)) {
                p.empty();
            }
        }
    },
    remove(keys) {
        if (!is_1.default.array(keys)) {
            keys = [keys];
        }
        for (const k of keys) {
            const p = this.postWithKey(k);
            if (is_1.default.value(p)) {
                this.posts.splice(this.posts.indexOf(p), 1);
                for (const key in this.categories) {
                    this.categories[key].removePost(p);
                }
            }
        }
    },
    photoTagList(photos) {
        const postTags = [];
        for (const p of photos) {
            const toRemove = [];
            for (let i = 0; i < p.tags.length; i++) {
                const tagSlug = p.tags[i];
                const tagName = this.tags[tagSlug];
                if (is_1.default.value(tagName)) {
                    p.tags[i] = tagName;
                    if (postTags.indexOf(tagName) == -1) {
                        postTags.push(tagName);
                    }
                }
                else {
                    toRemove.push(tagSlug);
                }
            }
            for (const tagSlug of toRemove) {
                const index = p.tags.indexOf(tagSlug);
                if (index >= 0) {
                    p.tags.splice(index, 1);
                }
            }
        }
        return (postTags.length > 0) ? postTags.join(', ') : null;
    },
    load() { return null; },
    getEXIF() { return null; },
    getPostWithPhoto() { return null; },
    getPhotosWithTags() { return null; }
};
