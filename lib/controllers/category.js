"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const json_ld_1 = require("../json-ld");
const config_1 = require("../config");
const _1 = require("../util/");
const template_1 = require("../template");
const library_1 = require("../library");
const constants_1 = require("../constants");
function view(res, path, homePage = false) {
    res.sendView(path, {
        callback: render => {
            const category = library_1.default.categoryWithKey(path);
            if (is_1.default.value(category)) {
                category.ensureLoaded().then(() => {
                    const linkData = json_ld_1.default.fromCategory(category, path, homePage);
                    const count = category.posts.length;
                    const options = { posts: category.posts };
                    const subtitle = config_1.default.site.postAlias + (count > 1 ? 's' : '');
                    renderCategory(render, template_1.default.page.CATEGORY, category, linkData, options, count, subtitle);
                });
            }
            else {
                res.notFound();
            }
        }
    });
}
function forPath(req, res) {
    view(res, req.params[constants_1.route.ROOT_CATEGORY] + '/' + req.params[constants_1.route.CATEGORY]);
}
function home(_req, res) {
    const category = library_1.default.categories[config_1.default.library.defaultCategory];
    let year = new Date().getFullYear();
    let subcategory = null;
    let count = 0;
    while (count == 0) {
        subcategory = category.getSubcategory(year.toString());
        if (is_1.default.value(subcategory)) {
            count = subcategory.posts.length;
        }
        year--;
    }
    view(res, subcategory.key, true);
}
function list(req, res) {
    const key = req.params[constants_1.route.ROOT_CATEGORY];
    if (is_1.default.value(key)) {
        res.sendView(key, {
            callback: render => {
                const category = library_1.default.categoryWithKey(key);
                if (is_1.default.value(category)) {
                    const linkData = json_ld_1.default.fromCategory(category);
                    const count = category.subcategories.length;
                    const options = { subcategories: category.subcategories };
                    const subtitle = 'Subcategories';
                    renderCategory(render, template_1.default.page.CATEGORY_LIST, category, linkData, options, count, subtitle);
                }
                else {
                    res.notFound();
                }
            }
        });
    }
    else {
        res.notFound();
    }
}
function menu(_req, res) {
    const t = template_1.default.page.CATEGORY_MENU;
    res.sendView(t, {
        callback: render => {
            render(t, { library: library_1.default, layout: template_1.default.layout.NONE });
        }
    });
}
function renderCategory(render, template, category, linkData, options, childCount, subtitle) {
    render(template, Object.assign(options, {
        title: category.title,
        jsonLD: json_ld_1.default.serialize(linkData),
        headerCSS: config_1.default.style.css.categoryHeader,
        subtitle: _1.default.number.say(childCount) + ' ' + subtitle
    }));
}
exports.default = { home, list, forPath, menu };
//# sourceMappingURL=category.js.map