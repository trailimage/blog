'use strict';

const is = require('./is');
const factory = require('./factory');

/**
 * Collection of photos grouped into "posts" (called a "set" or "album" in most providers)
 * that are in turn assigned "post tags"
 */
module.exports = {
   // root tags indexed by their name
   tags: {},
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
         factory.loadLibrary(callback);
      }
   },

   // empty library object before reloading from source
   empty() {
      this.loaded = false;
      this.postInfoLoaded = false;
      this.posts = [];
      this.tags = {};
      this.photoTags = {};
   },

   /**
    * Array of all post slugs
    * @returns {String[]}
    */
   postSlugs() { return this.posts.map(p => p.slug); },

   /**
    * Array of all post tag slugs
    * @param {String[]} [names] List of tag names or all if no list given
    * @returns {String[]}
    */
   tagSlugs(names) {
      let slugs = [];

      if (is.array(names) && names.length > 0) {
         // get slugs only for named tags
         for (let childName of names) {
            for (let key in this.tags) {
               let parentTag = this.tags[key];
               let childTag = parentTag.child(childName);

               slugs.push(parentTag.slug);
               if (is.value(childTag)) { slugs.push(childTag.slug); }
            }
         }
      } else {
         // get slugs for all tags
         for (let key in this.tags) {
            let parentTag = this.tags[key];

            slugs.push(parentTag.slug);
            for (let childTag of parentTag.tags) { slugs.push(childTag.slug); }
         }
      }
      return slugs;
   },

   /**
    * Find post tag with given slug
    * @param {String} slug
    * @returns {Object}
    */
   tagWithSlug(slug) {
      let rootSlug = (slug.includes('/')) ? slug.split('/')[0] : slug;

      for (let key in this.tags) {
         let tag = this.tags[key];
         if (tag.slug == rootSlug) {
            return (slug != rootSlug) ? tag.child(slug) : tag;
         }
      }
      return null;
   },

   // find post with given ID
   postWithID(id) {
      for (let p of this.posts) { if (p.id === id) { return p; } }
      return null;
   },

   // find post with given slug
   postWithSlug(slug, partSlug) {
      if (is.value(partSlug)) { slug += "/" + partSlug; }
      for (let p of this.posts) { if (p.isMatch(slug)) { return p; } }
      return null;
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