import { is, merge, sayNumber } from '@toba/tools';
import { Category, blog } from '@trailimage/models';
import { JsonLD } from '@toba/json-ld';
import { Request, Response } from 'express';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page } from '../views/template';
import { Renderer, view, ViewContext } from '../views/view';

function send(req: Request, res: Response, path: string, homePage = false) {
   view.send(res, path, async renderer => {
      // use renderer to build view that wasn't cached
      const category = blog.categoryWithKey(path);

      if (is.value(category)) {
         await category.ensureLoaded();

         const jsonLD = category.jsonLD(); //(path, homePage);
         const count = category.posts.size;
         const context = { posts: Array.from(category.posts) };
         const subtitle = config.site.postAlias + (count > 1 ? 's' : '');

         renderCategory(
            renderer,
            Page.Category,
            category,
            jsonLD,
            context,
            count,
            subtitle
         );
      } else {
         view.notFound(req, res);
      }
   });
}

/**
 * A particular category like When/2013.
 */
export function forPath(req: Request, res: Response) {
   send(
      req,
      res,
      req.params[RouteParam.RootCategory] +
         '/' +
         req.params[RouteParam.Category]
   );
}

/**
 * "Home" page shows latest default category that contains posts.
 * This is still messed up from a configurability perspective since it assumes
 * the default tag has years as child tags
 */
export function home(req: Request, res: Response) {
   const category = blog.categories.get(config.posts.defaultCategory);
   let year = new Date().getFullYear();
   let subcategory = null;
   let count = 0;

   while (count == 0) {
      // step backwards until a year with posts is found
      subcategory = category.getSubcategory(year.toString());
      if (is.value<Category>(subcategory)) {
         count = subcategory.posts.size;
      }
      year--;
   }
   send(req, res, subcategory.key, true);
}

/**
 * Show root category with list of subcategories.
 */
export function list(req: Request, res: Response) {
   const key = req.params[RouteParam.RootCategory] as string;

   if (is.empty(key)) {
      return view.notFound(req, res);
   }

   view.send(res, key, renderer => {
      // use renderer to build view that wasn't cached
      const category = blog.categoryWithKey(key);

      if (is.value(category)) {
         const jsonLD = category.jsonLD();
         const count = category.subcategories.size;
         const context = { subcategories: Array.from(category.subcategories) };
         const subtitle = 'Subcategories';

         renderCategory(
            renderer,
            Page.CategoryList,
            category,
            jsonLD,
            context,
            count,
            subtitle
         );
      } else {
         view.notFound(req, res);
      }
   });
}

export function menu(_req: Request, res: Response) {
   view.send(res, Page.CategoryMenu, render => {
      render(Page.CategoryMenu, { blog, layout: Layout.None });
   });
}

/**
 * Render category if it wasn't cached.
 */
function renderCategory(
   render: Renderer,
   template: string,
   category: Category,
   jsonLD: JsonLD.Blog | JsonLD.WebPage,
   context: ViewContext,
   childCount: number,
   subtitle: string
) {
   render(
      template,
      merge<ViewContext>(context, {
         title: category.title,
         jsonLD,
         headerCSS: config.style.css.categoryHeader,
         subtitle: `${sayNumber(childCount)} ${subtitle}`
      })
   );
}

export const category = { forPath, home, list, menu };
