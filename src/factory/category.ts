import { Category, Post, Flickr } from '../types/';
import is from '../is';
import post from './post';
import { slug } from '../util/text';
import config from '../config';
import library from '../library';

function getSubcategory(this:Category, key:string):Category {
   return this.subcategories.find(c => c.title === key || c.key === key);
}

function has(this:Category, key:string):boolean {
   return this.getSubcategory(key) !== undefined;
}

/**
 * Add nested category and update its key to include parent
 */
function add(this:Category, subcat:Category) {
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
function removePost(this:Category, post:Post):Category {
   const index = this.posts.indexOf(post);
   if (index >= 0) { this.posts.splice(index, 1); }
   this.subcategories.forEach(s => { s.removePost(post); });
   return this;
}

/**
 * Ensure photos and information are loaded for all posts
 */
function ensureLoaded(this:Category):Promise<any> {
   return Promise.all(this.posts.map(p => p.getInfo().then(p => p.getPhotos())));
}

/**
 * Add Flickr collection to library singleton as category
 */
function make(collection:Flickr.Collection, root = false):Category {
   let exclude = config.flickr.excludeSets;
   const feature = config.flickr.featureSets;
   const category:Category = {
      title: collection.title,
      key: slug(collection.title),
      subcategories: [] as Category[],
      posts: [] as Post[],
      get isChild() { return this.key.includes('/'); },
      get isParent() { return this.subcategories.length > 0; },
      add,
      getSubcategory,
      has,
      removePost,
      ensureLoaded
   };
   let p:Post = null;

   if (exclude === undefined) { exclude = []; }
   if (root) { library.categories[category.title] = category; }

   if (is.array(collection.set) && collection.set.length > 0) {
      // category contains one or more posts
      for (const s of collection.set) {
         if (exclude.indexOf(s.id) == -1) {
            // see if post is already present in the library in another category
            p = library.postWithID(s.id);

            // create item object if it isn't part of an already added group
            if (!is.value(p)) { p = post.make(s); }

            // add post to category and category to post
            category.posts.push(p);
            p.categories[category.key] = category.title;

            // also add post to library (faster lookups)
            library.addPost(p);
         }
      }
   }

   if (is.array(collection.collection)) {
      // recursively add subcategories
      collection.collection.forEach(c => { category.add(make(c)); });
   }

   if (root && is.array(feature)) {
      // sets to feature at the collection root can be manually defined in provider options
      for (const f of feature) {
         const p = post.make(f, false);
         p.feature = true;
         library.addPost(p);
      }
   }
   return category;
}

export default { make };