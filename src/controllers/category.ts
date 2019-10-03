import { is, merge, sayNumber } from '@toba/node-tools';
import { Category, blog } from '@trailimage/models';
import { Request, Response } from 'express';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page } from '../views/template';
import { view, ViewContext } from '../views/view';

function send(req: Request, res: Response, path: string) {
   view.send(res, path, async render => {
      // use renderer to build view that wasn't cached
      const category = blog.categoryWithKey(path);

      if (!is.value<Category>(category)) {
         return view.notFound(req, res);
      }

      await category.ensureLoaded();

      const count = category.posts.size;

      render(
         Page.Category,
         standardContext(category, count, {
            jsonLD: category.jsonLD(),
            subtitle: config.site.postAlias + (count > 1 ? 's' : ''),
            posts: Array.from(category.posts)
         })
      );
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
   let subcategory: Category | undefined = undefined;
   let postCount = 0;
   let tryCount = 0;

   if (category === undefined) {
      return view.internalError(
         res,
         new Error(
            `Unable to find default category ${config.posts.defaultCategory}`
         )
      );
   }

   while (postCount == 0 && tryCount < 10) {
      // step backwards until a year with posts is found
      subcategory = category.getSubcategory(year.toString());
      if (is.value<Category>(subcategory)) {
         postCount = subcategory.posts.size;
      }
      tryCount++;
      year--;
   }
   if (subcategory === undefined) {
      return view.internalError(
         res,
         new Error(
            `Unable to find year with posts in ${config.posts.defaultCategory}`
         )
      );
   }
   send(req, res, subcategory.key);
}

/**
 * Show root category with list of subcategories.
 */
export function list(req: Request, res: Response) {
   const key = req.params[RouteParam.RootCategory] as string;

   if (is.empty(key)) {
      return view.notFound(req, res);
   }

   view.send(res, key, render => {
      // use renderer to build view that wasn't cached
      const category = blog.categoryWithKey(key);

      if (!is.value<Category>(category)) {
         return view.notFound(req, res);
      }

      render(
         Page.CategoryList,
         standardContext(category, category.subcategories.size, {
            jsonLD: category.jsonLD(),
            subtitle: 'Subcategories',
            subcategories: Array.from(category.subcategories)
         })
      );
   });
}

export function menu(_req: Request, res: Response) {
   view.send(res, Page.CategoryMenu, render => {
      render(Page.CategoryMenu, { blog, layout: Layout.None });
   });
}

/**
 * Add standard category context fields.
 * @param childCount Number of posts or subcategories in the category
 */
const standardContext = (
   category: Category,
   childCount: number,
   context: ViewContext
): ViewContext =>
   merge<ViewContext>(context, {
      title: category.title,
      subtitle: `${sayNumber(childCount)} ${context.subtitle}`
   });

export const category = { forPath, home, list, menu };
