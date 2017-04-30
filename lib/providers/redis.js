"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const config_1 = require("../config");
const item_1 = require("../cache/item");
const Redis = require("redis");
const URL = require("url");
const url = URL.parse(config_1.default.redis.url);
const client = Redis.createClient(parseInt(url.port), url.hostname, {
    no_ready_check: true,
    password: url.auth.split(':')[1]
});
const dataType = {
    NONE: 0,
    OKAY: 1,
    COUNT: 2,
    BIT: 3,
    RAW: 4,
    JSON: 5
};
const code = {
    BROKEN: 'CONNECTION_BROKEN',
    TIMEOUT: 'ETIMEDOUT',
    ERROR: 'ERR'
};
const command = {
    AUTH: 'AUTH',
    DEL: 'DEL',
    EXEC: 'EXEC',
    GET: 'GET',
    HASH_GET: 'HGET',
    HASH_DEL: 'HDEL'
};
let connected = false;
let ready = true;
client.on('error', (err) => {
    let fatal = false;
    if (err.code == code.BROKEN) {
        logger_1.default.error('Unable to connect to Redis at %s:%d', url.hostname, url.port);
        fatal = true;
    }
    else if (err.code == code.ERROR && err.command == command.AUTH) {
        logger_1.default.error('Unable to authorize Redis at %s:%d (%s)', url.hostname, url.port, err.message);
        fatal = true;
    }
    else {
        logger_1.default.error('Error during redis call: %s', err.message);
    }
    if (fatal) {
        ready = false;
    }
});
client.on('connect', () => {
    logger_1.default.infoIcon('settings_input_component', 'Redis connected to %s:%d', url.hostname, url.port);
    connected = true;
});
client.on('end', () => {
    logger_1.default.warn('Redis connection has ended');
    connected = false;
});
function normalize(value) {
    if (typeof value == is_1.default.type.OBJECT) {
        return is_1.default.cacheItem(value) ? item_1.default.serialize(value) : JSON.stringify(value);
    }
    else {
        return value;
    }
}
function parseObject(value) {
    if (is_1.default.empty(value)) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (err) {
        logger_1.default.error('Unable to JSON parse "%s"', value);
        return null;
    }
}
function makeHandler(key, type = dataType.NONE, resolve, reject) {
    const howMany = (key) => is_1.default.array(key) ? key.length : 1;
    const answer = (actual, expected) => {
        resolve((expected === undefined) ? actual : (actual == expected));
    };
    return (err, reply) => {
        if (hasError(key, err)) {
            reject(err);
        }
        else {
            switch (type) {
                case dataType.BIT:
                    answer(reply, 1);
                    break;
                case dataType.OKAY:
                    answer(reply, 'OK');
                    break;
                case dataType.COUNT:
                    answer(reply, howMany(key));
                    break;
                case dataType.RAW:
                    answer(reply);
                    break;
                case dataType.JSON:
                    answer(parseObject(reply));
                    break;
                case dataType.NONE:
                    resolve();
                    break;
                default: reject('Unknown Redis data type');
            }
        }
    };
}
function getValue(type, key, hashKey) {
    return new Promise((resolve, reject) => {
        const handler = makeHandler(key, type, resolve, reject);
        if (hashKey === undefined) {
            client.get(key, handler);
        }
        else {
            client.hget(key, hashKey, handler);
        }
    });
}
function hasError(key, err) {
    if (is_1.default.value(err)) {
        if (is_1.default.array(key)) {
            key = key.join(',');
        }
        logger_1.default.error('Operation with key "%s" resulted in', key, err);
        if (err['message'] && err.message.indexOf(`memory > 'maxmemory'`) > 0) {
            logger_1.default.error('Disabling all caching');
            config_1.default.cache.setAll(false);
        }
        return true;
    }
    return false;
}
exports.default = {
    dataType,
    getAll: (key) => new Promise((resolve, reject) => {
        client.hgetall(key, makeHandler(key, dataType.RAW, resolve, reject));
    }),
    exists: (key, hashKey) => new Promise((resolve, reject) => {
        const handler = makeHandler(key, dataType.BIT, resolve, reject);
        if (hashKey === undefined) {
            client.exists(key, handler);
        }
        else {
            client.hexists(key, hashKey, handler);
        }
    }),
    keys: (key) => new Promise((resolve, reject) => {
        const handler = makeHandler(key, dataType.RAW, resolve, reject);
        if (/[\?\*\[\]]/.test(key)) {
            client.keys(key, handler);
        }
        else {
            client.hkeys(key, handler);
        }
    }),
    get(key, hashKey) {
        return getValue(dataType.RAW, key, hashKey);
    },
    getObject(key, hashKey) {
        return getValue(dataType.JSON, key, hashKey);
    },
    getValue,
    add(key, hashKeyOrValue, value) {
        let hashKey;
        if (value === undefined) {
            value = hashKeyOrValue;
        }
        else {
            hashKey = hashKeyOrValue;
        }
        return (new Promise((resolve, reject) => {
            if (hashKey !== undefined) {
                client.hset(key, hashKey, normalize(value), makeHandler(key, dataType.NONE, resolve, reject));
            }
            else {
                client.set(key, normalize(value), makeHandler(key, dataType.OKAY, resolve, reject));
            }
        }))
            .then(() => value);
    },
    addAll: (key, hash) => new Promise((resolve, reject) => {
        client.hmset(key, hash, makeHandler(key, dataType.OKAY, resolve, reject));
    }),
    remove: (key, hashKey) => new Promise((resolve, reject) => {
        if (is_1.default.empty(key)) {
            reject('Attempt to delete hash item with empty key');
        }
        else if (is_1.default.value(hashKey)) {
            if ((is_1.default.array(hashKey) && hashKey.length === 0) || is_1.default.empty(hashKey)) {
                reject('Attempt to delete "' + key + '" field with empty field name');
            }
            else {
                if (is_1.default.array(key)) {
                    resolve(Promise.all(key.map(k => new Promise((resolve, reject) => {
                        client.hdel([k].concat(hashKey), makeHandler(key, dataType.COUNT, resolve, reject));
                    }))));
                }
                else {
                    client.hdel([key].concat(hashKey), makeHandler(key, dataType.COUNT, resolve, reject));
                }
            }
        }
        else {
            client.del(key, makeHandler(key, dataType.COUNT, resolve, reject));
        }
    }),
    disconnect() {
        if (connected) {
            client.quit();
            connected = false;
        }
    }
};
//# sourceMappingURL=redis.js.map