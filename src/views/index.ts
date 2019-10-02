import { PhotoBlog } from '@trailimage/models';

export { Page, Layout, addTemplateMethods } from './template';
export { view, Renderer } from './view';
export { checkCacheReset, requireSSL } from './middleware';

/**
 * Sort blog categories for optimal menu display.
 */
export function sortCategories(blog: PhotoBlog) {
   blog.categories.forEach(c => {
      if (c.title.toLowerCase() != 'when') {
         c.subcategories = sortSet(c.subcategories, (c1, c2) =>
            textCompare(c1.title, c2.title)
         );
      }
   });

   const order: { [key: string]: number } = {
      When: 1,
      Who: 2,
      What: 3,
      Where: 4
   };

   blog.categories = sortMap(
      blog.categories,
      (c1, c2) => order[c1.title] - order[c2.title]
   );
}

const textCompare = (t1: string, t2: string): number =>
   t1 < t2 ? -1 : t1 > t2 ? 1 : 0;

/**
 * Reconstruct set object in order to sort it.
 */
const sortSet = <V>(s: Set<V>, sorter: (a: V, b: V) => number): Set<V> =>
   new Set([...s.values()].sort(sorter));

/**
 * Reconstruct map object in order to sort it.
 */
const sortMap = <K, V>(
   m: Map<K, V>,
   sorter: (a: V, b: V) => number
): Map<K, V> => new Map([...m.entries()].sort((a, b) => sorter(a[1], b[1])));
