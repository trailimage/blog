'use strict';

const is = require('./is');
const factory = require('./factory');

/**
 * Collection of photos grouped into "posts" (called a "set" or "album" in most providers)
 * that are in turn assigned "post tags"
 */
module.exports = {
   // root tags indexed by their name
   categories: {},
   // flat reference to all posts for simplified lookup
   posts: [],
   // all photo tags in hash[slug] = full name format
   photoTags: {},
   loaded: false,
   postInfoLoaded: false,

   load(callback) {
      if (this.loaded) {
         callback(this);
      } else {
         //factory.makeLibrary(callback);
      }
   },

   // empty library object before reloading from source
   empty() {
      this.loaded = false;
      this.postInfoLoaded = false;
      this.posts = [];
      this.categories = {};
      this.photoTags = {};
   },

   /**
    * Array of all post slugs
    * @returns {String[]}
    */
   postSlugs() { return this.posts.map(p => p.slug); },

   /**
    * Array of all category slugs
    * @param {String[]} [names] List of category names or all if no list given
    * @returns {String[]}
    */
   categorySlugs(names = []) {
      let slugs = [];

      if (names.length > 0) {
         // get slugs only for named categories
         for (let childName of names) {
            for (let key in this.categories) {
               let category = this.categories[key];
               let subcat = category.subcategory(childName);

               slugs.push(category.slug);
               if (is.value(subcat)) { slugs.push(subcat.slug); }
            }
         }
      } else {
         // get slugs for all categories
         for (let key in this.categories) {
            let category = this.categories[key];

            slugs.push(category.slug);
            for (let subcat of category.subcategories) { slugs.push(subcat.slug); }
         }
      }
      return slugs;
   },

   /**
    * Find category with given slug
    * @param {String} slug
    * @returns {Object}
    */
   categoryWithSlug(slug) {
      let rootSlug = (slug.includes('/')) ? slug.split('/')[0] : slug;

      for (let key in this.categories) {
         let cat = this.categories[key];
         if (cat.slug == rootSlug) {
            return (slug != rootSlug) ? cat.child(slug) : cat;
         }
      }
      return null;
   },

   // find post with given ID
   postWithID(id) { return this.posts.find(p => p.id === id); },

   // find post with given slug
   postWithSlug(slug, partSlug) {
      if (is.value(partSlug)) { slug += "/" + partSlug; }
      return this.posts.find(p => p.isMatch(slug));
   },

   /**
    * Unload particular posts to force refresh from source
    * @param {String[]} slugs
    */
   unload(slugs) {
      for (let s of slugs) {
         let p = this.postWithSlug(s);
         // removing post details will force it to reload on next access
         if (p !== null) { p.removeDetails(); }
      }
   },

   /**
    * Get unique list of tags used on photos in the post and update photo tags to use full names
    * @param {Object[]} photos
    * @returns {String} Unique list of photo tags
    */
   photoTagList(photos) {
      // all photo tags in the post
      let postPhotoTags = [];

      for (let p of photos) {
         // tag slugs to remove from photo
         let toRemove = [];

         for (let i = 0; i < p.tags.length; i++) {
            let tagSlug = p.tags[i];
            // lookup full tag name from its slug
            let tagName = this.photoTags[tagSlug];

            if (is.value(tagName)) {
               // replace tag slug in photo with tag name
               p.tags[i] = tagName;
               if (postPhotoTags.indexOf(tagName) == -1) { postPhotoTags.push(tagName); }
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
      return (postPhotoTags.length > 0) ? postPhotoTags.join(', ') : null;
   }
};