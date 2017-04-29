"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = require("./map");
const api_1 = require("./api");
const redis_1 = require("./redis");
const memory_1 = require("./memory");
exports.default = {
    api: api_1.default,
    map: map_1.default,
    view: memory_1.default,
    getItem: redis_1.getItem,
    add: redis_1.add
};
