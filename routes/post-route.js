var Setting = require('../settings.js');
var Format = require('../format.js');
var Enum = require('../enum.js');
/** @type {Library} */
var Library = require('../models/library.js');
/** @type {Post} */
var Post = require('../models/post.js');
/** @type {singleton} */
var Flickr = require('../adapters/flickr.js');
/** @type {singleton} */
var Output = require('../adapters/output.js');
/** @see https://github.com/kangax/html-minifier */
var htmlMinify = require('html-minifier').minify;
var log = require('winston');

/** @type {Boolean} */
var prepared = false;
/** @type {FlickrAPI} */
var flickr = null;
/** @type {Library} */
var library = null;
/** @type {Output} */
var output = null;

/**
 * Photo sizes to retrieve from Flickr API
 * @type {String[]}
 */
var sizes = [
	Flickr.size.small240,       // thumbnail preview
	Flickr.size.medium640,      // some older image have no size larger than 640x480
	Flickr.size.medium800,
	Flickr.size.large1024,
	Flickr.size.large1600,
	Flickr.size.large2048       // enlarged size
];

function prepare()
{
	if (!prepared)
	{
		flickr = Flickr.current;
		library = Library.current;
		output = Output.current;
		prepared = true;
	}
}

/**
 * Default route action
 */
exports.view = function(req, res)
{
	prepare();
	showPost(res, req.params.slug);
};

/**
 * "Home" page shows latest post
 * @param req
 * @param res
 */
exports.home = function(req, res)
{
	prepare();
	if (library != null) { showPost(res, library.posts[0].slug); }
	else { notReady(res); }
};

exports.flickrID = function(req, res)
{
	prepare();

	var post = library.postWithID(req.params['postID']);

	if (post != null)
	{
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + post.slug);
	}
	else
	{
		Output.replyNotFound(res, id);
	}
};

/**
 * Show featured set at Flickr
 * @param req
 * @param res
 */
exports.featured = function(req, res)
{
	res.redirect(Enum.httpStatus.permanentRedirect, 'http://www.flickr.com/photos/trailimage/sets/72157631638576162/');
};

/**
 * Clear cache and post's tag caches
 * @param req
 * @param res
 */
exports.newPost = function(req, res)
{
	prepare();

	/** @type {Post} */
	var post = library.postWithSlug(req.params['slug']);

	if (post != null)
	{
		/** @type {String[]} */
		var tags = library.tagSlugs(post.tags);
		log.warn('Removing tags ["%s"] from cache', tags.join('", "'));

		output.remove(tags, function(done)
		{
			if (!done)
			{
				log.warn('Failed to remove tags ["%s"] (may just mean some were not cached)', tags.join('", "'));
			}
			log.warn('Refreshing library');
			Library.refresh();
		});

		log.warn('Removing post "%s" from cache', post.slug);

		output.remove(post.slug, function(done)
		{
			if (!done) { log.error('Failed to remove "%s" from cache', post.slug); }
			if (post.next) { clearPost(post.next.slug); }
			if (post.previous) { clearPost(post.previous.slug); }
			res.redirect('/' + post.slug);
		});
	}
	else
	{
		log.error('Post slug "%s" not found in models', post.slug);
	}
};

//- Cache clearing ------------------------------------------------------------

/**
 * Clear all posts from cache
 * @param req
 * @param res
 */
exports.clearAll = function(req, res)
{
	prepare();

	var slugs = library.postSlugs().concat(['about','contact','search']);

	log.warn('Removing all posts from cache');

	output.remove(slugs);
	res.redirect('/');
};

exports.clear = function(req, res) { refreshPost(res, req.params.slug); };
exports.clearSeriesPost = function(req, res) { refreshPost(res, seriesPostSlug(req)); };

/**
 * Remove post content from cache and reload page
 * @param res
 * @param {String} slug
 */
function refreshPost(res, slug)
{
	// reload page even if an error ocurrs
	clearPost(slug, function() { res.redirect('/' + slug); });
}

/**
 *
 * @param {String} slug
 * @param {Function} [callback]
 */
function clearPost(slug, callback)
{
	prepare();
	log.warn('Removing post "%s" from cache', slug);
	output.remove(slug, function(done)
	{
		if (!done) { log.error('Failed to remove "%s" from cache', slug); }
		if (callback) { callback(); }
	});
}

//- Redirects -----------------------------------------------------------------

/**
 * Redirect to posts that haven't been transitioned from the old blog
 */
exports.blog = function(req, res)
{
	var slug = req.params.slug.replace(/\.html?$/, '');

	if (slug in Post.blogUrl && !Format.isEmpty(Post.blogUrl[slug]))
	{
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + Post.blogUrl[slug]);
	}
	else
	{
		// send to old blog
		var url = 'http://trailimage.blogspot.com/' + req.params['year'] + '/' + req.params['month'] + '/' + req.params['slug'];
		log.warn('Sending %s request to %s', slug, url);
		res.redirect(Enum.httpStatus.temporaryRedirect, url);
	}
};

/**
 * Display post that's part of a series
 * @param req
 * @param res
 */
exports.seriesPost = function(req, res)
{
	prepare();
	showPost(res, seriesPostSlug(req));
};

/**
 * Slug for single post within a series
 * @returns {string}
 */
function seriesPostSlug(req)
{
	return req.params['groupSlug'] + '/' + req.params['partSlug'];
}

/**
 * Redirect routes that have changed
 * @param app
 */
exports.addFixes = function(app)
{
	var fixes =
	{
		'/brother-rider-2013-a-night-in-pierce': '/brother-ride-2013',
		'/backroads-to-college': '/panhandle-past-and-future'
	};

	for (var i in fixes)
	{
		app.get(i, function(req, res) { res.redirect(Enum.httpStatus.permanentRedirect, fixes[i]); });
	}
};

function notReady(res)
{
	var retrySeconds = Setting.retryDelay / Enum.time.second;

	log.warn('Library not ready. Trying again in %d seconds.', retrySeconds);

	res.set('Retry-After', retrySeconds);
	res.render('503',
	{
		'title': 'Image Service is not Responding',
		'setting': Setting,
		'wait': retrySeconds,
		'layout': 'layouts\\blank'
	});
}

/**
 *
 * @param res
 * @param {String} slug
 * @param {String} [template]
 */
function showPost(res, slug, template)
{
	res.fromCache(slug, function(cacher)
	{
		if (library == null) { notReady(res); return; }

		var post = library.postWithSlug(slug);

		if (post == null) { res.notFound(slug); return; }

		flickr.getSet(post.id, sizes, function(photos, info)
		{
			if (template === undefined) { template = 'post'; }

			/** @type {String} */
			var map = '';
			/** @type {Object.<int>} */
			var video = null;
			/** @type {String} */
			var dateTaken = null;
			/** @type {String} */
			var description = null;
			/** @type {String} */
			var keywords = null;

			if (post.id != Setting.flickr.poemSet && post.id != Setting.flickr.featureSet)
			{
				video = getVideoMetadata(info);
				dateTaken = getDateTaken(photos.photo);
				map = getMapCoordinates(photos.photo);
				keywords = getKeywords(photos);
				description = getDescription(info, photos.photo, video);
			}

			cacher(slug, template,
			{
				'photos': photos,
				'info': info,
				'keywords': keywords,
				'post': post,
				'map': (Format.isEmpty(map)) ? null : encodeURIComponent('size:tiny' + map),
				'dateTaken': dateTaken,
				'video': video,
				'title': info.title._content,
				'slug': slug,
				'description': description,
				'setting': Setting
			});
		});
	});
}

/**
 * Get YouTube ID and dimensions for video link
 * @param {Flickr.SetInfo} info
 */
function getVideoMetadata(info)
{
	var video = null;
	var re = Enum.pattern.video;
	/** @type {String} */
	var d = info.description._content;

	if (re.test(d))
	{
		re.lastIndex = 0;
		var match = re.exec(d);
		video = {id: match[4], width: match[2], height: match[3]};
		// remove video link from description
		info.description._content = d.replace(match[0], '').replace(/[\r\n\s]*$/, '');
		re.lastIndex = 0;
	}
	return video;
}

/**
 * Format set description
 * @param {Flickr.SetInfo} info
 * @param {Flickr.PhotoSummary[]} photos
 * @param {Object.<int>} video
 */
function getDescription(info, photos, video)
{
	var description = null;

	if (!Format.isEmpty(info.description._content))
	{
		description = Format.string('{0} (Includes {1} photos', info.description._content, photos.length);
		description += (video == null) ? '.)' : ' and one video.)'
	}

	return description;
}

/**
 * Get unique list of tags used on photos in the post
 * @param {Flickr.SetPhotos} set
 * @return {String}
 */
function getKeywords(set)
{
	/** @type {Flickr.PhotoSummary[]} */
	var photos = set.photo;
	/** @type {String[]} */
	var tags = [];
	/** @type {String[]} */
	var photoTags = [];

	for (var i = 0; i < photos.length; i++)
	{
		var t = photos[i].tags.split(' ');
		photoTags = [];

		for (var j = 0; j < t.length; j++)
		{
			var tag = library.photoTags[t[j]];     // lookup original tag name

			if (tag)
			{
				photoTags.push(tag);
				if (tags.indexOf(tag) == -1) { tags.push(tag); }
			}
		}
		// update tag list with original tag names
		set.photo[i].tags = photoTags.join(', ');
	}
	return (tags.length > 0) ? tags.join(', ') : null;
}

/**
 * Get the overall date for the photo set
 * @param {Flickr.PhotoSummary[]} photos
 * @return {String}
 */
function getDateTaken(photos)
{
	/** @type {int} */
	var firstDatedPhoto = 2;    // use third photo in case the first few are generated map images

	if (photos.length <= firstDatedPhoto) { firstDatedPhoto = photos.length - 1; }
	return Format.date(Format.parseDate(photos[firstDatedPhoto].datetaken));
}

/**
 * @param {Flickr.PhotoSummary[]} photos
 * @return {String}
 */
function getMapCoordinates(photos)
{
	var start = 1;  // always skip first photo
	var total = photos.length;
	var map = '';

	if (total > Setting.google.maxMarkers)
	{
		start = 5;  // skip the first few which are often just prep shots
		total = Setting.google.maxMarkers + 5;
		if (total > photos.length) { total = photos.length; }
	}

	for (var i = start; i < total; i++)
	{
		if (photos[i].latitude)
		{
			map += '|' + photos[i].latitude + ',' + photos[i].longitude;
		}
	}

	return map;
}