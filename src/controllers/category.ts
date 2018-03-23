import { Category, photoBlog } from '../models/index';
import { is, merge, sayNumber } from '@toba/tools';
import { serialize } from '@toba/json-ld';
import config from '../config';
import { Page, Layout } from '../views/template';
import { RouteParam } from '../routes';
import { Response, Request } from 'express';
import { view, Renderer } from '../views/view';

function viewIt(req: Request, res: Response, path: string, homePage = false) {
   view.send(res, path, {
      callback: render => {
         // use renderer to build view that wasn't cached
         const category = photoBlog.categoryWithKey(path);

         if (is.value(category)) {
            category.ensureLoaded().then(() => {
               const linkData = category.linkDataString(path, homePage);
               const count = category.posts.length;
               const options = { posts: category.posts };
               const subtitle = config.site.postAlias + (count > 1 ? 's' : '');

               renderCategory(
                  render,
                  Page.Category,
                  category,
                  linkData,
                  options,
                  count,
                  subtitle
               );
            });
         } else {
            view.notFound(req, res);
         }
      }
   });
}

/**
 * A particular category like When/2013
 */
export function forPath(req: Request, res: Response) {
   viewIt(
      req,
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
export function home(req: Request, res: Response) {
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
   viewIt(req, res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories.
 */
export function list(req: Request, res: Response) {
   const key = req.params[RouteParam.RootCategory] as string;

   if (is.value(key)) {
      view.send(res, key, {
         callback: render => {
            // use renderer to build view that wasn't cached
            const category = photoBlog.categoryWithKey(key);

            if (is.value(category)) {
               const linkData = category.linkDataString();
               const count = category.subcategories.length;
               const context = { subcategories: category.subcategories };
               const subtitle = 'Subcategories';

               renderCategory(
                  render,
                  Page.CategoryList,
                  category,
                  linkData,
                  context,
                  count,
                  subtitle
               );
            } else {
               view.notFound(req, res);
            }
         }
      });
   } else {
      view.notFound(req, res);
   }
}

export function menu(_req: Request, res: Response) {
   view.send(res, Page.CategoryMenu, {
      callback: render => {
         render(Page.CategoryMenu, { photoBlog, layout: Layout.None });
      }
   });
}

/**
 * Render category if it wasn't cached.
 */
function renderCategory(
   render: Renderer,
   template: string,
   category: Category,
   linkData: any,
   context: { [key: string]: any },
   childCount: number,
   subtitle: string
) {
   render(
      template,
      merge(context, {
         title: category.title,
         jsonLD: serialize(linkData),
         headerCSS: config.style.css.categoryHeader,
         subtitle: `${sayNumber(childCount)} ${subtitle}`
      })
   );
}

export const category = { forPath, home, list, menu };
