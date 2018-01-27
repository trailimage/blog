"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const item_1 = require("./item");
const redis_1 = require("../providers/redis");
function addItem(key, hashKey, value, enabled) {
    return item_1.default
        .create(hashKey, value)
        .then(item => enabled ? redis_1.default.add(key, hashKey, item) : Promise.resolve(item));
}
function getItem(key) {
    return redis_1.default.getObject(key);
}
exports.getItem = getItem;
function add(key, value) {
    return redis_1.default.add(key, value);
}
exports.add = add;
function provide(hashKey, enabled) {
    const exists = (key) => enabled ? redis_1.default.exists(key, hashKey) : Promise.resolve(false);
    return {
        getItem: (key) => redis_1.default.getObject(hashKey, key).then(item_1.default.deserialize),
        keys: () => redis_1.default.keys(hashKey),
        add: (key, text) => addItem(hashKey, key, text, enabled),
        create: item_1.default.create,
        exists,
        addIfMissing(key, buffer) {
            return enabled
                ? exists(key).then(yep => (yep ? Promise.resolve(null) : this.add(key, buffer)))
                : Promise.resolve();
        },
        remove: (keys) => redis_1.default.remove(hashKey, keys),
        serialize: item_1.default.serialize
    };
}
exports.provide = provide;
exports.default = { provide };
//# sourceMappingURL=redis.js.map