"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const redis_1 = require("../providers/redis");
const prefix = 'api:';
const provider = {
    prefix,
    getItem(key, hashKey) {
        return redis_1.default.getObject(prefix + key, hashKey);
    },
    add: (key, hashKeyOrValue, value) => redis_1.default.add(prefix + key, hashKeyOrValue, value),
    keys: () => redis_1.default.keys(prefix + '*'),
    remove: (key, hashKey) => redis_1.default.remove(is_1.default.array(key) ? key.map(k => prefix + k) : prefix + key, hashKey)
};
exports.default = provider;
