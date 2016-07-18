'use strict';

// translate Flickr responses into standard objects

const is = require('./is');
const re = require('./regex');
const flickr = require('./flickr');
const format = require('./format');
const linkBase = 'flickr.com/photos/'; //trailimage/16345961839
// Flickr size tokens
const size = {
   thumbnail:  'url_t',
   square75:	'url_sq',
   square150:  'url_q',
   small240:   'url_s',
   small320:   'url_n',
   medium500:  'url_m',
   medium640:  'url_z',
   medium800:  'url_c',
   large1024:  'url_l',
   large1600:  'url_h',
   large2048:  'url_k',
   original:   'url_o'
};

function buildLibrary(library, flickrTree, featureSets, excludeSets) {
   for (let c of flickrTree.collection) {
      addCollection(library, c, excludeSets, true, featureSets);
   }
   return library;
}

// add Flickr collection to the library
function addCollection(library, collection, excludeSets, root, featureSets) {
   let t = this.buildPostTag(collection);
   let p = null;

   if (excludeSets === undefined) { excludeSets = []; }
   if (root === undefined) { root = false; }
   if (root) { library.tags[t.title] = t; }

   if (is.array(collection.set) && collection.set.length > 0) {
      // tag contains one or more posts
      for (let s of collection.set) {
         if (excludeSets.indexOf(s.id) == -1) {
            // see if post is already present in the library under another tag
            p = library.postWithID(s.id);

            // create item object if it isn't part of an already added group
            if (p === null) { p = this.buildPost(s); }

            t.addPost(p);        // add post to tag
            library.addPost(p);  // also add post to library (faster lookups)
         }
      }
   }

   if (collection.collection) {
      // recursively add child tags
      collection.collection.forEach(c => { t.addChild(addCollection(library, c, excludeSets)); });
   }

   if (root && is.array(featureSets)) {
      // sets to feature at the collection root can be manually defined in provider options
      for (let f of featureSets) {
         let post = this.buildPost(f, false);
         post.feature = true;
         library.addPost(post);
      }
   }
   return t;
}

module.exports = {
   sizeField: {
      // arrays allow fallback to smaller sizes
      thumb: size.square150,
      preview: size.small320,
      normal: [size.large1024, size.medium800, size.medium640],
      big: [size.large2048, size.large1600, size.large1024]
   },

   // create post from Flickr photo set
   buildPost(flickrSet, chronological) {
      let p = new TI.Post();

      p.id = flickrSet.id;
      p.chronological = (chronological === undefined) || chronological;
      p.originalTitle = flickrSet.title;

      let parts = p.originalTitle.split(re.subtitle);

      p.title = parts[0];

      if (parts.length > 1) {
         p.subTitle = parts[1];
         p.seriesSlug = format.slug(p.title);
         p.partSlug = format.slug(p.subTitle);
         p.slug = p.seriesSlug + '/' + p.partSlug;
      } else {
         p.slug = format.slug(p.originalTitle);
      }
      return p;
   },

   // convert Flickr collection into a post tag
   buildPostTag(collection) {
      let pt = new TI.PostTag();
      pt.title = collection.title;
      pt.slug = format.slug(collection.title);
      pt.tags = [];
      pt.posts = [];
      return pt;
   },

   // arse Flickr photo summary
   buildPostPhoto(s, index) {
      let p = new TI.Photo();

      p.id = s.id;
      p.index = index + 1;
      p.sourceUrl = linkBase + s.pathalias + '/' + s.id;
      p.title = s.title;
      p.description = s.description._content;
      /**
       * tag slugs are later updated to proper names
       * @see Library.photoTagList
       */
      p.tags = is.empty(s.tags) ? [] : s.tags.split(' ');
      p.dateTaken = format.parseDate(s.datetaken);
      p.latitude = parseFloat(s.latitude);
      p.longitude = parseFloat(s.longitude);
      p.primary = (parseInt(s.isprimary) == 1);
      p.size.preview = this.buildPhotoSize(s, this.sizeField.preview);
      p.size.normal = this.buildPhotoSize(s, this.sizeField.normal);
      p.size.big = this.buildPhotoSize(s, this.sizeField.big);
      return p;
   },

   buildPostInfo(post, setInfo) {
      const lineBreak = /[\r\n]/g;

      post.video = this.buildVideoInfo(setInfo); // removes video information from setInfo.description
      post.createdOn = format.parseTimeStamp(setInfo.date_create);
      post.updatedOn = format.parseTimeStamp(setInfo.date_update);
      post.photoCount = setInfo.photos;
      // long description is updated after photos are loaded
      post.description = this.longDescription = setInfo.description._content.remove(lineBreak);
      // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
      // http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'

      // thumb URLs may be needed before photos are loaded, e.g. in RSS XML
      let thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;

      post.bigThumbURL = thumb + '.jpg';     // 500px
      post.smallThumbURL = thumb + '_s.jpg';
      post.infoLoaded = true;
   },

   buildAllPostPhotos(post, flickrSetPhotos) {
      post.addPhotos(flickrSetPhotos.photo.map((p, index) => this.buildPostPhoto(p, index)));
   },

   // parse Flickr photo summary used in thumb search
   buildSearchPhoto(s, sizeField) {
      let p = new TI.Photo();
      // only one size supported
      if (is.array(sizeField)) { sizeField = sizeField[0]; }

      p.id = s.id;
      p.size.thumb = this.buildPhotoSize(s, sizeField);
      return p;
   },

   /**
    * @param {Flickr.PhotoSummary} s
    * @param {String|String[]} sizeField Size or list of size field names in order of preference
    * @returns {TI.PhotoSize}
    */
   buildPhotoSize(s, sizeField) {
      let field = null;
      let size = new TI.PhotoSize();

      if (is.array(sizeField)) {
         // iterate through size preferences to find first that isn't empty
         for (field of sizeField) {
            // break with given size url assignment if it exists in the photo summary
            if (!is.empty(s[field])) { break; }
         }
      } else {
         field = sizeField;
      }

      if (field !== null) {
         let suffix = field.remove('url');

         if (!is.empty(s[field])) {
            size.url = s[field];
            size.width = parseInt(s['width' + suffix]);
            size.height = parseInt(s['height' + suffix]);
         }
      }
      return size;
   },

   buildPhotoTags(flickrTags, exclusions) {
      if (exclusions === undefined) { exclusions = []; }
      let tags = {};

      for (let t of flickrTags) {
         let text = t.raw[0]._content;

         if (text.indexOf('=') == -1 && exclusions.indexOf(text) == -1) {
            // not a machine tag and not a tag to be removed
            tags[t.clean] = text;
         }
      }
      return tags;
   },

   // YouTube ID and dimensions for video link
   buildVideoInfo(setInfo) {
      let d = setInfo.description._content;

      if (re.video.test(d))	{
         let video = new TI.Video();
         let match = re.video.exec(d);

         video.id = match[4];
         video.width = parseInt(match[2]);
         video.height = parseInt(match[3]);
         // remove video link from description
         setInfo.description._content = d.remove(match[0]).remove(/[\r\n\s]*$/);

         return video;
      } else {
         return null;
      }
   },

   buildExif(xf) {
      let exif = new TI.EXIF();

      exif.populate(xf, (exif, tag) => {
         for (let e of exif) { if (e.tag == tag) { return e.raw._content; } }
         return null;
      });

      exif.sanitize();

      return exif;
   }
};