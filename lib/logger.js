"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("./is");
const util_1 = require("./util");
const config_1 = require("./config");
const constants_1 = require("./constants");
const URL = require("url");
const Winston = require("winston");
const RedisTx = require("winston-redis");
let queryable = false;
const level = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};
let logger = null;
function provider() {
    if (logger === null) {
        logger = new Winston.Logger({
            transports: config_1.default.log.targets.map(t => {
                switch (t) {
                    case constants_1.logTo.CONSOLE:
                        return new Winston.transports.Console();
                    case constants_1.logTo.REDIS:
                        const url = URL.parse(config_1.default.redis.url);
                        const tx = new RedisTx({
                            host: url.hostname,
                            port: url.port,
                            auth: url.auth.split(':')[1],
                            length: 10000
                        });
                        tx.on('error', (err) => {
                            try {
                                const r = logger.transports[constants_1.logTo.REDIS];
                                logger.remove(r);
                            }
                            catch (err) {
                                console.error('Unable to remove Redis logger');
                            }
                            try {
                                logger.add(new Winston.transports.Console());
                            }
                            catch (err) {
                                console.error(err);
                            }
                        });
                        queryable = true;
                        return tx;
                    case constants_1.logTo.FILE:
                }
            })
        });
    }
    return logger;
}
function iconInvoke(icon, level, message, args) {
    args.push({ iconName: icon });
    invoke(level, message, args);
}
function invoke(l, message, args) {
    args.unshift(message);
    const p = provider();
    switch (l) {
        case level.DEBUG:
            p.debug.apply(p, args);
            break;
        case level.INFO:
            p.info.apply(p, args);
            break;
        case level.WARN:
            p.warn.apply(p, args);
            break;
        case level.ERROR:
            p.error.apply(p, args);
            break;
    }
}
function parseLogs(results) {
    const sameDay = (d1, d2) => (d1 != null && d2 != null && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
    const grouped = {};
    if (is_1.default.defined(results, 'redis')) {
        let day = null;
        let dayKey = null;
        for (const r of results.redis) {
            util_1.default.logMessage(r, 'message');
            const d = new Date(r.timestamp);
            const h = d.getHours();
            r.timestamp = util_1.default.format('{0}:{1}:{2}.{3} {4}', (h > 12) ? h - 12 : h, util_1.default.number.pad(d.getMinutes(), 2), util_1.default.number.pad(d.getSeconds(), 2), util_1.default.number.pad(d.getMilliseconds(), 3), (h >= 12) ? 'PM' : 'AM');
            if (!sameDay(day, d)) {
                day = d;
                dayKey = util_1.default.format('{0}, {1} {2}', constants_1.weekday[d.getDay()], constants_1.month[d.getMonth()], d.getDate());
                grouped[dayKey] = [];
            }
            grouped[dayKey].push(r);
        }
    }
    return grouped;
}
function query(daysAgo, maxRows = 500) {
    const options = {
        from: new Date((new Date()).getTime() - (constants_1.time.DAY * daysAgo)),
        rows: maxRows,
        fields: null
    };
    return new Promise((resolve, reject) => {
        if (queryable) {
            provider().query(options, (err, results) => {
                if (err === null) {
                    resolve(parseLogs(results));
                }
                else {
                    error(err.toString());
                    reject(err);
                }
            });
        }
        else {
            resolve();
        }
    });
}
function error(message, ...args) { invoke(level.ERROR, message, args); }
exports.default = {
    info(message, ...args) { invoke(level.INFO, message, args); },
    infoIcon(icon, message, ...args) { iconInvoke(icon, level.INFO, message, args); },
    warn(message, ...args) { invoke(level.WARN, message, args); },
    warnIcon(icon, message, ...args) { iconInvoke(icon, level.WARN, message, args); },
    error,
    errorIcon(icon, message, ...args) { iconInvoke(icon, level.ERROR, message, args); },
    query,
    reset() { logger = null; },
    inject: {
        set transport(t) {
            logger = new Winston.Logger({ transports: [t] });
        }
    }
};
//# sourceMappingURL=logger.js.map