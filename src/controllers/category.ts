import { Blog } from '../types/';
import { Category, photoBlog } from '../models/index';
import { is } from '@toba/tools';
import { fromCategory, serialize } from '../json-ld';
import config from '../config';
import util from '../util/';
import template from '../template';
import { RouteParam } from '../routes';

function view(res: Blog.Response, path: string, homePage = false) {
   res.sendView(path, {
      callback: render => {
         // use renderer to build view that wasn't cached
         const category = photoBlog.categoryWithKey(path);

         if (is.value(category)) {
            category.ensureLoaded().then(() => {
               const linkData = fromCategory(category, path, homePage);
               const count = category.posts.length;
               const options = { posts: category.posts };
               const subtitle = config.site.postAlias + (count > 1 ? 's' : '');

               renderCategory(
                  render,
                  template.page.CATEGORY,
                  category,
                  linkData,
                  options,
                  count,
                  subtitle
               );
            });
         } else {
            res.notFound();
         }
      }
   });
}

/**
 * A particular category like When/2013
 */
function forPath(req: Blog.Request, res: Blog.Response) {
   view(
      res,
      req.params[RouteParam.RootCategory] +
         '/' +
         req.params[RouteParam.Category]
   );
}

/**
 * "Home" page shows latest default category that contains posts
 * This is still messed up from a configurability perspective since it assumes
 * the default tag has years as child tags
 */
function home(_req: Blog.Request, res: Blog.Response) {
   const category = photoBlog.categories[config.library.defaultCategory];
   let year = new Date().getFullYear();
   let subcategory = null;
   let count = 0;

   while (count == 0) {
      // step backwards until a year with posts is found
      subcategory = category.getSubcategory(year.toString());
      if (is.value<Category>(subcategory)) {
         count = subcategory.posts.length;
      }
      year--;
   }
   view(res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories
 */
function list(req: Blog.Request, res: Blog.Response) {
   const key = req.params[RouteParam.RootCategory] as string;

   if (is.value(key)) {
      res.sendView(key, {
         callback: render => {
            // use renderer to build view that wasn't cached
            const category = photoBlog.categoryWithKey(key);

            if (is.value(category)) {
               const linkData = fromCategory(category);
               const count = category.subcategories.length;
               const options = { subcategories: category.subcategories };
               const subtitle = 'Subcategories';

               renderCategory(
                  render as Blog.Renderer,
                  template.page.CATEGORY_LIST,
                  category,
                  linkData,
                  options,
                  count,
                  subtitle
               );
            } else {
               res.notFound();
            }
         }
      });
   } else {
      res.notFound();
   }
}

function menu(_req: Blog.Request, res: Blog.Response) {
   const t = template.page.CATEGORY_MENU;
   res.sendView(t, {
      callback: render => {
         render(t, { photoBlog, layout: template.layout.NONE });
      }
   });
}

/**
 * Render category if it wasn't cached
 */
function renderCategory(
   render: Blog.Renderer,
   template: string,
   category: Category,
   linkData: any,
   options: { [key: string]: any },
   childCount: number,
   subtitle: string
) {
   render(
      template,
      Object.assign(options, {
         title: category.title,
         jsonLD: serialize(linkData),
         headerCSS: config.style.css.categoryHeader,
         subtitle: util.number.say(childCount) + ' ' + subtitle
      })
   );
}

export default { home, list, forPath, menu };
