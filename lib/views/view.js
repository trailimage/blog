"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_ld_1 = require("@toba/json-ld");
const logger_1 = require("@toba/logger");
const tools_1 = require("@toba/tools");
const uglify = require("uglify-js");
const compress = require("zlib");
const config_1 = require("../config");
const template_1 = require("./template");
exports.cache = new tools_1.Cache();
function compact(text, options) {
    const output = uglify.minify(text, options);
    if (output.error) {
        logger_1.log.error(output.error);
        return text;
    }
    else {
        return output.code;
    }
}
exports.compact = compact;
exports.createViewItem = (key, htmlOrJSON, type) => new Promise((resolve, reject) => {
    let text;
    let inferredType;
    if (tools_1.is.text(htmlOrJSON)) {
        text = htmlOrJSON;
        inferredType = tools_1.MimeType.HTML;
    }
    else {
        text = JSON.stringify(htmlOrJSON);
        inferredType = tools_1.MimeType.JSON;
    }
    if (type === undefined) {
        type = inferredType;
    }
    compress.gzip(Buffer.from(text), (err, buffer) => {
        if (tools_1.is.value(err)) {
            reject(err);
            logger_1.log.error(err, { slug: key });
        }
        else {
            resolve({
                buffer,
                eTag: key + '_' + new Date().getTime().toString(),
                type
            });
        }
    });
});
exports.IPv6 = (ip) => tools_1.is.empty(ip) || ip === '::1'
    ? '127.0.0.1'
    : ip.replace(/^::[0123456789abcdef]{4}:/g, '');
function clientIP(req) {
    let ipAddress = req.connection.remoteAddress;
    const forwardedIP = req.headers[tools_1.Header.ForwardedFor];
    if (!tools_1.is.empty(forwardedIP)) {
        const parts = forwardedIP.split(',');
        ipAddress = parts[0];
    }
    return exports.IPv6(ipAddress);
}
exports.clientIP = clientIP;
function notFound(req, res) {
    const ip = clientIP(req);
    logger_1.log.warn(`${req.originalUrl} not found for ${ip}`, { clientIP: ip });
    res.statusCode = tools_1.HttpStatus.NotFound;
    res.render(template_1.Page.NotFound, { title: 'Page Not Found', config: config_1.config });
}
exports.notFound = notFound;
function internalError(res, err) {
    if (tools_1.is.value(err)) {
        logger_1.log.error(err);
    }
    res.statusCode = tools_1.HttpStatus.InternalError;
    res.render(template_1.Page.InternalError, { title: 'Oops', config: config_1.config });
}
function send(res, slug, context, type, minify = false) {
    if (!sendFromCache(res, slug)) {
        const renderer = makeRenderer(res, slug);
        if (tools_1.is.callable(context)) {
            context(renderer);
        }
        else {
            renderer(slug, context, type, minify);
        }
    }
}
async function sendJSON(res, cacheKey, generator) {
    if (!sendFromCache(res, cacheKey)) {
        const json = JSON.stringify(await generator());
        cacheAndSend(res, json, cacheKey, tools_1.MimeType.JSON);
    }
}
function sendFromCache(res, slug) {
    if (config_1.config.cache.views) {
        const item = exports.cache.get(slug);
        if (item !== null) {
            writeItemToResponse(res, item);
            return true;
        }
        else {
            logger_1.log.info(`"${slug}" not cached`, { slug });
        }
    }
    else {
        logger_1.log.warn(`Caching disabled for ${slug}`, { slug });
    }
    return false;
}
function writeItemToResponse(res, item, cache = true) {
    res.setHeader(tools_1.Header.Content.Encoding, tools_1.Encoding.GZip);
    if (cache) {
        res.setHeader(tools_1.Header.CacheControl, 'max-age=86400, public');
    }
    else {
        res.setHeader(tools_1.Header.CacheControl, 'no-cache');
        res.setHeader(tools_1.Header.Expires, 'Tue, 01 Jan 1980 1:00:00 GMT');
        res.setHeader(tools_1.Header.PRAGMA, 'no-cache');
    }
    res.setHeader(tools_1.Header.eTag, item.eTag);
    res.setHeader(tools_1.Header.Content.Type, tools_1.addCharSet(item.type));
    res.write(item.buffer);
    res.end();
}
exports.writeItemToResponse = writeItemToResponse;
function makeRenderer(res, slug) {
    return (view, context, type, minify = false) => {
        if (tools_1.is.empty(context.description)) {
            context.description = config_1.config.site.description;
        }
        if (tools_1.is.defined(context, 'jsonLD')) {
            context.linkData = json_ld_1.serialize(context.jsonLD);
            delete context['jsonLD'];
        }
        context.config = config_1.config;
        res.render(view, context, (renderError, text) => {
            if (tools_1.is.value(renderError)) {
                logger_1.log.error(`Rendering ${slug} ${renderError.message}`, { slug });
                internalError(res);
            }
            else {
                if (tools_1.is.value(text)) {
                    if (minify) {
                        text = compact(text);
                    }
                    cacheAndSend(res, text, slug, type);
                }
                else {
                    logger_1.log.error(`renderTemplate(${slug}) returned no content`, {
                        slug
                    });
                    internalError(res);
                }
            }
        });
    };
}
async function cacheAndSend(res, body, slug, type) {
    const item = await exports.createViewItem(slug, body, type);
    exports.cache.add(slug, item);
    writeItemToResponse(res, item);
}
exports.view = {
    send,
    sendJSON,
    notFound,
    internalError
};
