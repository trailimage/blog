"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("./is");
const config_1 = require("./config");
const library_1 = require("./library");
const defaultContext = 'http://schema.org';
const contextField = '@context';
const typeField = '@type';
const idField = '@id';
function ld(type, fields = {}) {
    if (is_1.default.defined(fields, 'id')) {
        fields[idField] = fields['id'];
        delete fields['id'];
    }
    fields[typeField] = type;
    fields[contextField] = defaultContext;
    return fields;
}
function image(img) {
    const schema = { url: img.url };
    if (img.width) {
        schema.width = img.width;
    }
    if (img.height) {
        schema.height = img.height;
    }
    return ld('ImageObject', schema);
}
function place(post) {
    return ld('Place', {
        hasMap: config_1.default.site.url + '/' + post.key + '/map'
    });
}
function webPage(path = '') {
    return ld('WebPage', { id: pathUrl(path) });
}
const pathUrl = (path) => config_1.default.site.url + '/' + path;
function organization() {
    return ld('Organization', {
        name: config_1.default.site.title,
        logo: image(config_1.default.site.companyLogo)
    });
}
function owner() {
    return ld('Person', {
        name: config_1.default.owner.name,
        url: config_1.default.site.url + '/about',
        sameAs: config_1.default.owner.urls,
        mainEntityOfPage: webPage('about'),
        image: image(config_1.default.owner.image)
    });
}
function breadcrumb(url, title, position) {
    const schema = { item: { id: url, name: title } };
    if (!isNaN(position)) {
        schema.position = position;
    }
    return ld('BreadcrumbList', schema);
}
function searchAction() {
    const qi = 'query-input';
    const placeHolder = 'search_term_string';
    return ld('SearchAction', {
        target: config_1.default.site.url + '/search?q={' + placeHolder + '}',
        [qi]: 'required name=' + placeHolder
    });
}
function discoverAction(post) {
    return ld('DiscoverAction', {
        target: config_1.default.site.url + '/' + post.key + '/map'
    });
}
function serialize(linkData) {
    removeContext(linkData);
    return JSON.stringify(linkData, (key, value) => (value === null || value === 0) ? undefined : value);
}
function removeContext(linkData, context = null) {
    if (linkData !== undefined && linkData !== null && typeof (linkData) == is_1.default.type.OBJECT) {
        if (linkData.hasOwnProperty(contextField) && linkData[contextField] !== null) {
            if (context !== null && linkData[contextField] == context) {
                delete linkData[contextField];
            }
            else {
                context = linkData[contextField];
            }
        }
        for (const field in linkData) {
            removeContext(linkData[field], context);
        }
    }
}
exports.default = {
    contextField,
    typeField,
    idField,
    fromPost(post) {
        const categoryTitle = Object
            .keys(post.categories)
            .map(key => post.categories[key]);
        const schema = {
            author: owner(),
            name: post.title,
            headline: post.title,
            description: post.description,
            image: image(post.coverPhoto.size.normal),
            publisher: organization(),
            mainEntityOfPage: webPage(post.key),
            datePublished: post.createdOn,
            dateModified: post.updatedOn,
            articleSection: categoryTitle.join(',')
        };
        if (post.chronological && post.centroid != null) {
            schema.locationCreated = place(post);
            schema.potentialAction = discoverAction(post);
        }
        if (is_1.default.value(post.coverPhoto.size.thumb)) {
            schema.image.thumbnail = image(post.coverPhoto.size.thumb);
        }
        return ld('BlogPosting', schema);
    },
    fromCategory(category, key = category.key, homePage = false) {
        if (homePage) {
            return ld('Blog', {
                url: config_1.default.site.url,
                name: config_1.default.site.title,
                author: owner(),
                description: config_1.default.site.description,
                mainEntityOfPage: webPage(),
                potentialAction: searchAction(),
                publisher: organization()
            });
        }
        else {
            const schema = webPage(key);
            let position = 1;
            schema.name = category.title;
            schema.publisher = organization();
            schema.breadcrumb = [breadcrumb(config_1.default.site.url, 'Home', position++)];
            if (category.key.includes('/')) {
                const rootKey = category.key.split('/')[0];
                const rootCategory = library_1.default.categoryWithKey(rootKey);
                schema.breadcrumb.push(breadcrumb(config_1.default.site.url + '/' + rootCategory.key, rootCategory.title, position++));
            }
            schema.breadcrumb.push(breadcrumb(config_1.default.site.url + '/' + category.key, category.title, position));
            return schema;
        }
    },
    fromVideo(v) {
        return (v == null || v.empty) ? null : ld('VideoObject', {
            contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
            videoFrameSize: v.width + 'x' + v.height,
            description: null,
            uploadDate: null,
            thumbnailUrl: null
        });
    },
    owner,
    serialize
};
//# sourceMappingURL=json-ld.js.map