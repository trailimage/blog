import { Post, IMakeJsonLD } from './index';
import { is } from '@toba/tools';
import { JsonLD } from '@toba/json-ld';
import { forCategory } from './json-ld';

/**
 * Category contains posts.
 */
export class Category implements IMakeJsonLD<JsonLD.Blog | JsonLD.WebPage> {
   title: string = null;
   key: string = null;
   subcategories: Category[] = [];
   posts: Post[] = [];

   constructor(key: string, title: string) {
      this.key = key;
      this.title = title;
   }

   //unload(keys:string|string[]):void;

   getSubcategory(key: string): Category {
      return this.subcategories.find(c => c.title === key || c.key === key);
   }

   has(key: string): boolean {
      return this.getSubcategory(key) !== undefined;
   }

   /**
    * Add nested category and update its key to include parent
    */
   add(subcat: Category) {
      if (is.value(subcat)) {
         const oldKey = subcat.key;

         subcat.key = this.key + '/' + subcat.key;
         this.subcategories.push(subcat);

         // update posts that reference the tag by its old key
         for (const p of subcat.posts) {
            delete p.categories[oldKey];
            p.categories[subcat.key] = subcat.title;
         }
      }
   }

   /**
    * Remove post from category and subcategories (primarily for testing)
    */
   removePost(post: Post): Category {
      const index = this.posts.indexOf(post);
      if (index >= 0) {
         this.posts.splice(index, 1);
      }
      this.subcategories.forEach(s => {
         s.removePost(post);
      });
      return this;
   }

   /**
    * Ensure photos and information are loaded for all posts
    */
   ensureLoaded(): Promise<any> {
      return Promise.all(
         this.posts.map(p => p.getInfo().then(p => p.getPhotos()))
      );
   }

   get isChild() {
      return this.key.includes('/');
   }

   get isParent() {
      return this.subcategories.length > 0;
   }

   toJsonLD(): JsonLD.Blog | JsonLD.WebPage {
      return forCategory(this);
   }
}
