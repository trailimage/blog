"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const item_1 = require("./item");
const is_1 = require("../is");
const memory = {};
const provider = {
    getItem: (key) => Promise.resolve(memory[key]),
    keys: () => Promise.resolve(Object.keys(memory)),
    add: (key, value) => item_1.default.create(key, value).then(item => {
        if (config_1.default.cache.views) {
            memory[key] = item;
        }
        return Promise.resolve(item);
    }),
    create: item_1.default.create,
    exists: (key) => Promise.resolve(is_1.default.defined(memory, key)),
    addIfMissing(key, buffer) {
        return (config_1.default.cache.views)
            ? provider.exists(key).then(exists => exists ? Promise.resolve(null) : this.add(key, buffer))
            : Promise.resolve();
    },
    remove: (keys) => {
        if (is_1.default.array(keys)) {
            keys.forEach(k => delete memory[k]);
        }
        else {
            delete memory[keys];
        }
        return Promise.resolve();
    },
    serialize: (item) => item
};
exports.default = provider;
