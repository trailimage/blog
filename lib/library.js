const is = require('./is');

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * library methods are added by the factory.
 * @see addHelperMethods
 * @type {Library}
 */
module.exports = {
   /**
    * Root categories indexed by their name
    * @type {object.<Category>}
    */
   categories: {},
   /**
    * Flat reference to all posts for simplified lookup
    * @type {Post[]}
    */
   posts: [],
   /**
    * All photo tags in hash[slug] = full name format
    * @type {object.<string>}
    */
   tags: {},
   loaded: false,
   postInfoLoaded: false,
   /**
    * Track keys of posts and categories that change on library reload
    * (can be used for cache invalidation)
    * @type {string[]}
    */
   changedKeys: [],

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
    * @returns {string[]}
    */
   postKeys() { return this.posts.map(p => p.key); },

   /**
    * Array of all category keys
    * @param {string[]} [filterList] List of category names or all if no list given
    * @returns {string[]}
    */
   categoryKeys(filterList = []) {
      const keys = [];

      if (filterList.length > 0) {
         // get keys only for named categories
         if (!is.array(filterList)) { filterList = [filterList]; }
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
            category.subcategories.forEach(s => { keys.push(s.key); });
         }
      }
      return keys;
   },

   /**
    * Find category with given key
    * @param {string} key
    * @returns {Category}
    */
   categoryWithKey(key) {
      const rootKey = (key.includes('/')) ? key.split('/')[0] : key;

      for (const name in this.categories) {
         const cat = this.categories[name];
         if (cat.key == rootKey) {
            return (key != rootKey) ? cat.getSubcategory(key) : cat;
         }
      }
      return null;
   },

   /**
    * @returns {Promise.<Photo[]>}
    */
   photos() {
      return Promise.all(this.posts.map(p => p.getPhotos()))
         .then(what => {
            console.log(what);
         })
   },

   /**
    * Find post with given ID
    * @param {string} id
    * @returns {Post}
    */
   postWithID(id) { return this.posts.find(p => p.id == id); },

   /**
    * Find post with given slug
    * @param {string} key
    * @param {string} [partKey]
    * @returns {Post}
    */
   postWithKey(key, partKey) {
      if (is.value(partKey)) { key += '/' + partKey; }
      return this.posts.find(p => p.hasKey(key));
   },

   /**
    * Unload particular posts to force refresh from source
    * @param {string|string[]} keys
    */
   unload(keys) {
      if (!is.array(keys)) { keys = [keys]; }
      for (const k of keys) {
         const p = this.postWithKey(k);
         // removing post details will force it to reload on next access
         if (is.value(p)) { p.empty(); }
      }
   },

   /**
    * Remove posts (primarily for testing)
    * @param {string|string[]} keys
    */
   remove(keys) {
      if (!is.array(keys)) { keys = [keys]; }
      for (const k of keys) {
         const p = this.postWithKey(k);
         if (is.value(p)) {
            this.posts.splice(this.posts.indexOf(p), 1);
            for (const key in this.categories) { this.categories[key].removePost(p); }
         }
      }
   },

   /**
    * Get unique list of tags used on photos in the post and update photo tags to use full names
    * @param {Photo[]} photos
    * @returns {string} Unique list of photo tags
    */
   photoTagList(photos) {
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
               if (postTags.indexOf(tagName) == -1) { postTags.push(tagName); }
            } else {
               // remove tag slug from list
               // this can happen if a photo has tags intentionally excluded from the library
               toRemove.push(tagSlug);
            }
         }

         for (const tagSlug of toRemove) {
            const index = p.tags.indexOf(tagSlug);
            if (index >= 0) { p.tags.splice(index, 1); }
         }
      }
      return (postTags.length > 0) ? postTags.join(', ') : null;
   }
};