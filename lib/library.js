'use strict';

const is = require('./is');

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or "album" in most providers)
 * that are in turn assigned categories. Additional library methods are added by the factory.
 * @see addHelperMethods
 * @type {Library}
 */
module.exports = {
   /**
    * Root categories indexed by their name
    * @type {Object.<Category>}
    */
   categories: {},
   /**
    * Flat reference to all posts for simplified lookup
    * @type {Post[]}
    */
   posts: [],
   /**
    * All photo tags in hash[slug] = full name format
    * @type {Object.<String>}
    */
   tags: {},
   loaded: false,
   postInfoLoaded: false,

   // empty library object before reloading from source
   empty() {
      this.loaded = false;
      this.postInfoLoaded = false;
      this.posts = [];
      this.categories = {};
      this.tags = {};
   },

   /**
    * Array of all post keys
    * @returns {String[]}
    */
   postKeys() { return this.posts.map(p => p.key); },

   /**
    * Array of all category keys
    * @param {String[]} [filterList] List of category names or all if no list given
    * @returns {String[]}
    */
   categoryKeys(filterList = []) {
      const keys = [];

      if (filterList.length > 0) {
         // get keys only for named categories
         if (!is.array(filterList)) { filterList = [ filterList ]; }
         for (let filterName of filterList) {
            for (let name in this.categories) {
               let category = this.categories[name];
               let subcat = category.getSubcategory(filterName);

               if (name == filterName) {
                  keys.push(category.key);
               } else if (is.value(subcat)) {
                  keys.push(subcat.key);
               }
            }
         }
      } else {
         // get keys for all categories
         for (let name in this.categories) {
            let category = this.categories[name];
            keys.push(category.key);
            category.subcategories.forEach(s => { keys.push(s.key); });
         }
      }
      return keys;
   },

   /**
    * Find category with given key
    * @param {String} key
    * @returns {Category}
    */
   categoryWithKey(key) {
      let rootKey = (key.includes('/')) ? key.split('/')[0] : key;

      for (let name in this.categories) {
         let cat = this.categories[name];
         if (cat.key == rootKey) {
            return (key != rootKey) ? cat.getSubcategory(key) : cat;
         }
      }
      return null;
   },

   /**
    * Find post with given ID
    * @param {String} id
    * @returns {Post}
    */
   postWithID(id) { return this.posts.find(p => p.id == id); },

   /**
    * Find post with given slug
    * @param {String} key
    * @param {String} [partKey]
    * @returns {Post}
    */
   postWithKey(key, partKey) {
      if (is.value(partKey)) { key += '/' + partKey; }
      return this.posts.find(p => p.hasKey(key));
   },

   /**
    * Unload particular posts to force refresh from source
    * @param {String[]} keys
    */
   unload(keys) {
      for (let k of keys) {
         let p = this.postWithKey(k);
         // removing post details will force it to reload on next access
         if (is.value(p)) { p.empty(); }
      }
   },

   /**
    * Get unique list of tags used on photos in the post and update photo tags to use full names
    * @param {Photo[]} photos
    * @returns {String} Unique list of photo tags
    */
   photoTagList(photos) {
      // all photo tags in the post
      let postTags = [];

      for (let p of photos) {
         // tag slugs to remove from photo
         let toRemove = [];

         for (let i = 0; i < p.tags.length; i++) {
            let tagSlug = p.tags[i];
            // lookup full tag name from its slug
            let tagName = this.tags[tagSlug];

            if (is.value(tagName)) {
               // replace tag slug in photo with tag name
               p.tags[i] = tagName;
               if (postTags.indexOf(tagName) == -1) { postTags.push(tagName); }
            } else {
               // remove tag slug from list
               // this can happen if a photo has tags intentionally excluded from the library
               toRemove.push(tagSlug);
            }
         }

         for (let tagSlug of toRemove) {
            let index = p.tags.indexOf(tagSlug);
            if (index >= 0) { p.tags.splice(index, 1); }
         }
      }
      return (postTags.length > 0) ? postTags.join(', ') : null;
   }
};