import is from '../is';
import ld from '../json-ld';
import config from '../config';
import util from '../util';
import template from '../template';
import library from '../library';
import C from '../constants';
/** Route placeholders */
const ph = C.route;

/**
 * @param res
 * @param {string} path
 * @param {boolean} [homePage = false]
 */
function view(res, path, homePage = false) {
   res.sendView(path, render => {
      // use renderer to build view that wasn't cached
      const category = library.categoryWithKey(path);

      if (is.value(category)) {
         category.ensureLoaded().then(()=> {
            const linkData = ld.fromCategory(category, path, homePage);
            const count = category.posts.length;
            const options = { posts: category.posts };
            const subtitle = config.site.postAlias + ((count > 1) ? 's' : '');

            renderCategory(render, template.page.CATEGORY, category, linkData, options, count, subtitle);
         });
      } else {
         res.notFound();
      }
   });
}


/**
 * A particular category like When/2013
 */
function forPath(req, res) {
   view(res, req.params[ph.ROOT_CATEGORY] + '/' + req.params[ph.CATEGORY]);
}

/**
 * "Home" page shows latest default category that contains posts
 * This is still messed up from a configurability perspective since it assumes
 * the default tag has years as child tags
 * @param req
 * @param res
 */
function home(req, res) {
   const category = library.categories[config.library.defaultCategory];
   let year = (new Date()).getFullYear();
   let subcategory = null;
   let count = 0;

   while (count == 0) {
      // step backwards until a year with posts is found
      subcategory = category.getSubcategory(year.toString());
      if (is.value(subcategory)) { count = subcategory.posts.length; }
      year--;
   }
   view(res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories
 */
function list(req, res) {
   const key = req.params[ph.ROOT_CATEGORY];

   if (is.value(key)) {
      res.sendView(key, render => {
         // use renderer to build view that wasn't cached
         const category = library.categoryWithKey(key);

         if (is.value(category)) {
            const linkData = ld.fromCategory(category);
            const count = category.subcategories.length;
            const options = { subcategories: category.subcategories };
            const subtitle = 'Subcategories';

            renderCategory(render, template.page.CATEGORY_LIST, category, linkData, options, count, subtitle);
         } else {
            res.notFound();
         }
      });
   } else {
      res.notFound();
   }
}

function menu(req, res) {
   const t = template.page.CATEGORY_MENU;
   res.sendView(t, render => { render(t, { library, layout: template.layout.NONE }); });
}

/**
 * Render category if it wasn't cached
 */
function renderCategory(render:Function, template:string, category:Category, linkData:any, options:{[key:string]:any}, childCount:number, subtitle:string) {
   render(template, Object.assign(options, {
      title: category.title,
      jsonLD: ld.serialize(linkData),
      headerCSS: config.style.css.categoryHeader,
      subtitle: util.number.say(childCount) + ' ' + subtitle
   }));
}

export default { home, list, forPath, menu };