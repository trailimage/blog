"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const config_1 = require("../config");
const routes_1 = require("../routes");
const template_1 = require("../views/template");
const view_1 = require("../views/view");
function send(req, res, path, homePage = false) {
    view_1.view.send(res, path, async (render) => {
        const category = models_1.blog.categoryWithKey(path);
        if (!tools_1.is.value(category)) {
            return view_1.view.notFound(req, res);
        }
        await category.ensureLoaded();
        const count = category.posts.size;
        render(template_1.Page.Category, standardContext(category, count, {
            jsonLD: category.jsonLD(),
            subtitle: config_1.config.site.postAlias + (count > 1 ? 's' : ''),
            posts: Array.from(category.posts)
        }));
    });
}
function forPath(req, res) {
    send(req, res, req.params[routes_1.RouteParam.RootCategory] +
        '/' +
        req.params[routes_1.RouteParam.Category]);
}
exports.forPath = forPath;
function home(req, res) {
    const category = models_1.blog.categories.get(config_1.config.posts.defaultCategory);
    let year = new Date().getFullYear();
    let subcategory = null;
    let count = 0;
    while (count == 0) {
        subcategory = category.getSubcategory(year.toString());
        if (tools_1.is.value(subcategory)) {
            count = subcategory.posts.size;
        }
        year--;
    }
    send(req, res, subcategory.key, true);
}
exports.home = home;
function list(req, res) {
    const key = req.params[routes_1.RouteParam.RootCategory];
    if (tools_1.is.empty(key)) {
        return view_1.view.notFound(req, res);
    }
    view_1.view.send(res, key, render => {
        const category = models_1.blog.categoryWithKey(key);
        if (!tools_1.is.value(category)) {
            return view_1.view.notFound(req, res);
        }
        render(template_1.Page.CategoryList, standardContext(category, category.subcategories.size, {
            jsonLD: category.jsonLD(),
            subtitle: 'Subcategories',
            subcategories: Array.from(category.subcategories)
        }));
    });
}
exports.list = list;
function menu(_req, res) {
    view_1.view.send(res, template_1.Page.CategoryMenu, render => {
        render(template_1.Page.CategoryMenu, { blog: models_1.blog, layout: template_1.Layout.None });
    });
}
exports.menu = menu;
const standardContext = (category, childCount, context) => tools_1.merge(context, {
    title: category.title,
    headerCSS: config_1.config.style.css.categoryHeader,
    subtitle: `${tools_1.sayNumber(childCount)} ${context.subtitle}`
});
exports.category = { forPath, home, list, menu };
