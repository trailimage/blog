import { removeItem, is } from '@toba/tools';
import { Post, Category, Photo, EXIF } from './index';

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * library methods are added by the factory.
 */
class PhotoBlog {
   categories: { [key: string]: Category } = {};
   posts: Post[] = [];
   tags: { [key: string]: string } = {};
   loaded: boolean = false;
   postInfoLoaded: boolean = false;
   /**
    * Track keys of posts and categories that change on library reload
    * (can be used for cache invalidation)
    */
   changedKeys: string[];

   /** All photos in all posts */
   getPhotos(): Promise<Photo[]> {
      return Promise.all(this.posts.map(p => p.getPhotos())).then(photos =>
         photos.reduce((all, p) => all.concat(p), [] as Photo[])
      );
   }

   getEXIF: (photoID: string) => Promise<EXIF>;

   /**
    * Add post to library and link with adjacent posts
    */
   addPost(p: Post) {
      // exit if post with same ID is already present
      if (this.posts.filter(e => e.id === p.id).length > 0) {
         return;
      }
      this.posts.push(p);

      if (p.chronological && this.posts.length > 1) {
         const next = this.posts[this.posts.length - 2];
         if (next.chronological) {
            p.next = next;
            next.previous = p;
         }
      }
   }

   /**
    * Find category with given key
    */
   categoryWithKey(key: string): Category {
      const rootKey = key.includes('/') ? key.split('/')[0] : key;

      for (const name in this.categories) {
         const cat = this.categories[name];
         if (cat.key == rootKey) {
            return key != rootKey ? cat.getSubcategory(key) : cat;
         }
      }
      return null;
   }

   /**
    * Array of all category keys
    */
   categoryKeys(filterList: string[] = []): string[] {
      const keys: string[] = [];

      if (filterList.length > 0) {
         // get keys only for named categories
         if (!is.array(filterList)) {
            filterList = [filterList];
         }
         for (const filterName of filterList) {
            for (const name in this.categories) {
               const category = this.categories[name];
               const subcat = category.getSubcategory(filterName);

               if (name == filterName) {
                  keys.push(category.key);
               } else if (is.value(subcat)) {
                  keys.push(subcat.key);
               }
            }
         }
      } else {
         // get keys for all categories
         for (const name in this.categories) {
            const category = this.categories[name];
            keys.push(category.key);
            category.subcategories.forEach(s => {
               keys.push(s.key);
            });
         }
      }
      return keys;
   }

   /**
    * Find post with given ID
    */
   postWithID(id: string): Post {
      return this.posts.find(p => p.id == id);
   }

   /**
    * Find post with given slug
    */
   postWithKey(key: string, partKey: string = null): Post {
      if (is.value(partKey)) {
         key += '/' + partKey;
      }
      return this.posts.find(p => p.hasKey(key));
   }

   /**
    * Array of all post keys
    */
   postKeys(): string[] {
      return this.posts.map(p => p.key);
   }

   empty(): PhotoBlog {
      this.categories = {};
      this.posts = [];
      this.tags = {};
      this.loaded = false;
      this.postInfoLoaded = false;
      return this;
   }

   getPostWithPhoto: (photo: Photo | string) => Promise<Post>;
   getPhotosWithTags: (tags: string | string[]) => Promise<Photo[]>;

   /**
    * Get unique list of tags used on photos in the post and update photo tags
    * to use full names.
    */
   photoTagList(photos: Photo[]): string {
      // all photo tags in the post
      const postTags = [];

      for (const p of photos) {
         // tag slugs to remove from photo
         const toRemove = [];

         for (let i = 0; i < p.tags.length; i++) {
            const tagSlug = p.tags[i];
            // lookup full tag name from its slug
            const tagName = this.tags[tagSlug];

            if (is.value(tagName)) {
               // replace tag slug in photo with tag name
               p.tags[i] = tagName;
               if (postTags.indexOf(tagName) == -1) {
                  postTags.push(tagName);
               }
            } else {
               // remove tag slug from list
               // this can happen if a photo has tags intentionally excluded from the library
               toRemove.push(tagSlug);
            }
         }

         for (const tagSlug of toRemove) {
            const index = p.tags.indexOf(tagSlug);
            if (index >= 0) {
               p.tags.splice(index, 1);
            }
         }
      }
      return postTags.length > 0 ? postTags.join(', ') : null;
   }

   // load(emptyIfLoaded: boolean): Promise<Library>;

   /**
    * Unload particular posts to force refresh from source
    */
   unload(...keys: string[]) {
      for (const k of keys) {
         const p = this.postWithKey(k);
         // removing post details will force it to reload on next access
         if (is.value(p)) {
            p.empty();
         }
      }
   }

   /**
    * Remove posts (primarily for testing)
    */
   remove(...keys: string[]) {
      for (const k of keys) {
         const p = this.postWithKey(k);
         if (removeItem(this.posts, p)) {
            for (const key in this.categories) {
               this.categories[key].removePost(p);
            }
         }
      }
   }

   /**
    * Match posts that are part of a series
    */
   correlatePosts() {
      let p = this.posts[0];
      let parts = [];

      while (p != null && p.previous != null) {
         if (p.subTitle !== null) {
            parts.push(p);

            while (p.previous != null && p.previous.title == p.title) {
               p = p.previous;
               parts.unshift(p);
            }

            if (parts.length > 1) {
               parts[0].makeSeriesStart();

               for (let i = 0; i < parts.length; i++) {
                  parts[i].part = i + 1;
                  parts[i].totalParts = parts.length;
                  parts[i].isPartial = true;

                  if (i > 0) {
                     parts[i].previousIsPart = true;
                  }
                  if (i < parts.length - 1) {
                     parts[i].nextIsPart = true;
                  }
               }
            } else {
               p.ungroup();
            }
            parts = [];
         }
         p = p.previous;
      }
   }
}

/**
 * `PhotoBlog` singleton
 */
export const photoBlog = new PhotoBlog();
