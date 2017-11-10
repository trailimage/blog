"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const redis_1 = require("./redis");
exports.default = redis_1.default.provide("map", config_1.default.cache.maps);
//# sourceMappingURL=map.js.map