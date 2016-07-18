'use strict';

// translate Flickr responses into standard objects

const is = require('./is');
const re = require('./regex');
const log = require('./logger');
const cache = require('./cache');
const flickr = require('./flickr');
const format = require('./format');
const library = require('./library');
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

// region Library

function buildLibrary(json) {
   let library = null;

   if (is.value(Library.current)) {
      // refresh current instance
      library = Library.current;
      library.empty();
   } else {
      // create new instance
      library = new Library();
   }
   library = updateLibrary(library, json);
   library.correlatePosts();

   return library;
}


function updateLibrary(library, flickrTree) {
   for (let c of flickrTree.collection) {
      addCollection(library, c, excludeSets, true, featureSets);
   }
   return library;
}

// retrieve posts, post tags (categories) and photo tags from cache
function loadLibrary(callback) {
   loadPhotoTags(photoTags => {
      // post parsing depends on having the photo tags
      cache.getPosts((data, tree) => {
         if (tree !== null) {
            try {
               let library = buildLibrary(tree);
               this._loadAllCachedPosts(library, data);
               library.photoTags = photoTags;
               callback(library);
            } catch (error) {
               log.error('Unable to parse cached library (%s): must reload', error.toString());
               flickr.loadLibrary(callback, photoTags);
            }
         } else {
            // remove bad cache data
            //this.cache.clear();
            flickr.loadLibrary(callback, photoTags);
         }
      });
   });
}

// reload library from Flickr
function reloadLibrary(callback) {
   // track tag slugs that need to be refreshed if cached
   let tagSlugs = [];
   // record post slugs so they can be compared to the new list
   let postSlugs = library.posts.map(p => p.slug);

   reloadPhotoTags(photoTags => {
      flickr.loadLibrary(library => {
         // returned library instance should be same as above
         library.posts.filter(p => postSlugs.indexOf(p.slug) == -1).forEach(p => {
            // iterate over every post with a slug not present in postSlugs
            log.info('Found new post "%s"', p.title);
            // all tags applied to the new post will need to be refreshed
            tagSlugs = tagSlugs.concat(p.tagSlugs(p.tags));
            // update adjecent posts to correct next/previous links
            if (p.next !== null) { tagSlugs.push(p.next.slug); }
            if (p.previous !== null) { tagSlugs.push(p.previous.slug); }
         });
         if (is.callable(callback)) { callback(tagSlugs); }
      }, photoTags);
   });
}

// add Flickr collection to the library
function addCollection(library, collection, excludeSets, root, featureSets) {
   let t = buildPostTag(collection);
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
            if (p === null) { p = buildPost(s); }

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
         let post = buildPost(f, false);
         post.feature = true;
         library.addPost(post);
      }
   }
   return t;
}

// endregion
// region Posts

// asynchronously load details for all posts in library
function loadAllPosts(library) {
   let pending = library.posts.length;

   for (let p of library.posts) {
      // begin an async call for each post
      this.loadPostInfo(p, post => {
         if (post === null) {
            // if no post info was found then assume post doesn't belong in library
            log.warn('Removing post %s from library', p.id);
            this.cache.dequeue(p.id);
         }
         if (--pending <= 0) {
            library.postInfoLoaded = true;
            // write raw provider data to cache
            this.cache.flush();
            log.info('Finished loading library posts');
         }
      });
   }
}

// parse cached post data
function loadAllCachedPosts(library, cacheData) {
   for (let p of library.posts) {
      // TODO: handle empty data
      buildPostInfo(p, cacheData[p.id]);
   }
   library.postInfoLoaded = true;
   log.info('Finished loading library posts');
}

// create post from Flickr photo set
function buildPost(flickrSet, chronological) {
   const p = {};

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
}

function buildPostInfo(post, setInfo) {
   const description = setInfo.description._content.remove(/[\r\n]/g)
   const thumb = `http://farm${setInfo.farm}.staticflickr.com/${setInfo.server}/${setInfo.primary}_${setInfo.secret}`;

   return Object.assign(post, {
      // removes video information from setInfo.description
      video: buildVideoInfo(setInfo),
      createdOn: format.parseTimeStamp(setInfo.date_create),
      updatedOn: format.parseTimeStamp(setInfo.date_update),
      photoCount: setInfo.photos,
      description: description,
      // long description is updated after photos are loaded
      longDescription: description,
      // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
      // http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
      // thumb URLs may be needed before photos are loaded, e.g. in RSS XML
      bigThumbURL: thumb + '.jpg',     // 500px
      smallThumbURL: thumb + '_s.jpg',
      infoLoaded: true
   });
}

// convert Flickr collection into a post tag
function buildPostTag(collection) {
   return {
      title: collection.title,
      slug: format.slug(collection.title),
      tags: [],
      posts: []
   }
}

// endregion
// region Photos

// parse Flickr photo summary
function buildPostPhoto(s, index) {
   return {
      id: s.id,
      index: index + 1,
      sourceUrl: linkBase + s.pathalias + '/' + s.id,
      title: s.title,
      description: s.description._content,
      // tag slugs are later updated to proper names
      tags: is.empty(s.tags) ? [] : s.tags.split(' '),
      dateTaken: format.parseDate(s.datetaken),
      latitude: parseFloat(s.latitude),
      longitude: parseFloat(s.longitude),
      primary: (parseInt(s.isprimary) == 1),
      size: {
         preview: buildPhotoSize(s, this.sizeField.preview),
         normal: buildPhotoSize(s, this.sizeField.normal),
         big: buildPhotoSize(s, this.sizeField.big)
      }
   }
}

function buildAllPostPhotos(post, flickrSetPhotos) {
   post.addPhotos(flickrSetPhotos.photo.map((p, index) => buildPostPhoto(p, index)));
}

// parse Flickr photo summary used in thumb search
function buildSearchPhoto(s, sizeField) {
   // only one size supported for search result
   if (is.array(sizeField)) { sizeField = sizeField[0]; }
   return {
      id: s.id,
      size: { thumb: buildPhotoSize(s, sizeField) }
   };
}

function buildPhotoSize(s, sizeField) {
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
}

/**
 * Load photo tags from cache or source
 * @param {function(Object.<String>)} callback
 */
function loadPhotoTags(callback) {
   this.cache.getPhotoTags(tags => {
      if (tags !== null) {
         log.info('Photo tags loaded from cache');
         callback(tags)
      } else {
         flickr.loadPhotoTags(rawTags => {
            let tags = buildPhotoTags(rawTags, this.options.excludeTags);
            this.cache.addPhotoTags(tags);
            callback(tags);
         });
      }
   });
}

// endregion

// YouTube ID and dimensions for video link
function buildVideoInfo(setInfo) {
   let d = setInfo.description._content;

   if (re.video.test(d))	{
      let match = re.video.exec(d);
      // remove video link from description
      setInfo.description._content = d.remove(match[0]).remove(/[\r\n\s]*$/);
      return {
         id: match[4],
         width: parseInt(match[2]),
         height: parseInt(match[3])
      };
   } else {
      return null;
   }
}

// region EXIF

const exif = {
   build(xf) {
      let exif = new TI.EXIF();

      exif.populate(xf, (exif, tag) => {
         for (let e of exif) { if (e.tag == tag) { return e.raw._content; } }
         return null;
      });

      exif.sanitize();

      return exif;
   },
   sanitize: {
      all(x) {
         if (!x.sanitized) {
            if (is.value(x.artist) && re.artist.test(x.artist)) {
               // only sanitize EXIF for photos shot by known artists
               this.model = sanitizeCamera(this.model);
               this.lens = sanitizeLens(this.lens, this.model);
               this.compensation = sanitizeCompensation(this.compensation);
               // don't show focal length for primes
               if (!numericRange.test(this.lens)) { this.focalLength = null; }
            }
            this.software = sanitizeSoftware(this.software);
            this.sanitized = true;
         }
      },
      camera(text) {
         return (is.empty(text)) ? '' : text
            .replace('NIKON', 'Nikon')
            .replace('ILCE-7R', 'Sony α7ʀ')
            .replace('ILCE-7RM2', 'Sony α7ʀ II')
            .replace('Sony α7ʀM2', 'Sony α7ʀ II')
            .replace('VS980 4G', 'LG G2')
            .replace('XT1060', 'Motorola Moto X')
            .replace('TG-4', 'Olympus Tough TG-3');
      },
      lens(text, camera) {
         return (is.empty(text)) ? '' : text
            .replace(/FE 35mm.*/i, 'Sony FE 35mm ƒ2.8')
            .replace(/FE 55mm.*/i, 'Sony FE 55mm ƒ1.8')
            .replace(/FE 90mm.*/i, 'Sony FE 90mm ƒ2.8 OSS')
            .replace('58.0 mm f/1.4', 'Voigtländer Nokton 58mm ƒ1.4 SL II')
            .replace('14.0 mm f/2.8', 'Samyang 14mm ƒ2.8')
            .replace('50.0 mm f/1.4', 'Sigma 50mm ƒ1.4 EX DG')
            .replace('35.0 mm f/2.0', (/D700/.test(camera) ? 'Zeiss Distagon T* 2/35 ZF.2' : 'Nikkor 35mm ƒ2.0D'))
            .replace('100.0 mm f/2.0', 'Zeiss Makro-Planar T* 2/100 ZF.2')
            .replace('150.0 mm f/2.8', 'Sigma 150mm ƒ2.8 EX DG HSM APO')
            .replace('90.0 mm f/2.8', 'Tamron 90mm ƒ2.8 SP AF Di')
            .replace('24.0 mm f/3.5', 'Nikkor PC-E 24mm ƒ3.5D ED')
            .replace('14.0-24.0 mm f/2.8', 'Nikon 14–24mm ƒ2.8G ED')
            .replace('24.0-70.0 mm f/2.8', 'Nikon 24–70mm ƒ2.8G ED')
            .replace('17.0-55.0 mm f/2.8', 'Nikon 17–55mm ƒ2.8G')
            .replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10–20mm ƒ4–5.6 EX DC HSM')
            .replace('1 NIKKOR VR 30-110mm f/3.8-5.6', 'Nikkor 1 30–110mm ƒ3.8–5.6 VR')
            .replace('1 NIKKOR VR 10-30mm f/3.5-5.6', 'Nikkor 1 10–30mm ƒ3.5–5.6 VR')
            .replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18–200mm ƒ3.5–5.6G ED VR')
            .replace(/Voigtlander Heliar 15mm.*/i, 'Voigtländer Heliar 15mm ƒ4.5 III');
      },
      software(text) {
         return (is.empty(text)) ? '' : text
            .replace('Photoshop Lightroom', 'Lightroom')
            .replace(/\s*\(Windows\)/, '');
      },
      compensation(text) {
         if (text == '0') { text = 'No'; }
         return text;
      }
   }
};


// endregion

module.exports = {
   sizeField: {
      // arrays allow fallback to smaller sizes
      thumb: size.square150,
      preview: size.small320,
      normal: [size.large1024, size.medium800, size.medium640],
      big: [size.large2048, size.large1600, size.large1024]
   },

   // size fields used to query provider when finding posts
   get sizesForPost() {
      return [].concat(this.sizeField.preview, this.sizeField.normal, this.sizeField.big);
   },
   // size fields used to query provider when rendering a map
   get sizesForMap() { return [this.sizeField.preview]; },

   // size fields used to query provider when searching for photos
   get sizesForSearch() { return [this.sizeField.thumb]; },

   buildLibrary,
   loadLibrary,
   reloadLibrary,

   buildPost,

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
   }
};