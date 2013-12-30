var Setting = require('../settings.js');
var Format = require('../format.js');
var Enum = require('../enum.js');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');
/** @type {MetadataSet} */
var MetadataSet = require('../metadata/set.js');
/** @type {singleton} */
var Flickr = require('../flickr.js');
/** @type {singleton} */
var Output = require('../output.js');
/** @see https://github.com/kangax/html-minifier */
var htmlMinify = require('html-minifier').minify;
var log = require('winston');

/** @type {Boolean} */
var prepared = false;
/** @type {FlickrAPI} */
var flickr = null;
/** @type {Metadata} */
var metadata = null;
/** @type {Output} */
var output = null;

/**
 * Photo sizes to retrieve from Flickr API
 * @type {Array.<String>}
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
		metadata = Metadata.current;
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
	showSet(res, req.params.slug);
};

exports.default = function(req, res)
{
	prepare();
	if (metadata != null) { showSet(res, metadata.sets[0].slug); }
	else { notReady(res); }
};

exports.photoID = function(req, res)
{
	prepare();

	/** @type {string} */
	var photoID = req.params.photoID;
	/** @type {string} */
	var setID;

	/** @var Array.<Flickr.MemberSet>) sets */
	flickr.getContext(photoID, function(sets)
	{
		if (sets)
		{
			for (i = 0; i < sets.length; i++)
			{
				setID = sets[i].id;
				if (setID != Setting.flickr.favoriteSet && setID != Setting.flickr.poemSet)
				{
					showSetWithID(res, setID);
					return;
				}
			}
		}
		Output.replyNotFound(res, photoID);
	});
};

exports.flickrID = function(req, res)
{
	showSetWithID(res, req.params.setID);
};

function showSetWithID(res, id)
{
	prepare();

	var set = metadata.setWithID(id);
	if (set != null) { res.redirect(Enum.httpStatus.permanentRedirect, '/' + set.slug)	}
	else { Output.replyNotFound(res, id); }
}

exports.clearAll = function(req, res)
{
	prepare();

	var slugs = metadata.setSlugs().concat(['about','contact','search']);

	log.warn('Removing all pages from cache');

	output.remove(slugs);
	res.redirect('/');
};

/**
 * Clear set cache and set's tag caches
 * @param req
 * @param res
 */
exports.newSet = function(req, res)
{
	prepare();

	/** @type {MetadataSet} */
	var set = metadata.setWithSlug(req.params.slug);

	if (set != null)
	{
		/** @type {Array.<String>} */
		var tags = metadata.tagSlugs(set.tags);
		log.warn('Removing tags ["%s"] from cache', tags.join('", "'));
		output.remove(tags, function(done)
		{
			if (!done)
			{
				log.warn('Failed to remove tags ["%s"] (may just mean some were not cached)', tags.join('", "'));
			}
			log.warn('Refreshing metadata');
			Metadata.refresh();
		});

		log.warn('Removing set "%s" from cache', set.slug);
		output.remove(set.slug, function(done)
		{
			if (!done) { log.error('Failed to remove "%s" from cache', set.slug); }
			clearAdjacent(set.next);
			clearAdjacent(set.previous);
			res.redirect('/' + set.slug);
		});
	}
	else
	{
		log.error('Set slug "%s" not found in metadata', set.slug);
	}
};

/**
 * @param {MetadataSet} set
 */
function clearAdjacent(set)
{
	if (set)
	{
		log.warn('Removing set "%s" from cache', set.slug);
		output.remove(set.next.slug, function(done)
		{
			if (!done) { log.error('Failed to remove "%s" from cache', set.slug); }
		});
	}
}

exports.clear = function(req, res)
{
	clearSet(res, req.params.slug);
};

exports.clearSubSet = function(req, res)
{
	clearSet(res, groupSetSlug(req));
};

function clearSet(res, slug)
{
	prepare();
	log.warn('Removing set "%s" from cache', slug);
	output.remove(slug, function(done)
	{
		if (!done) { log.error('Failed to remove "%s" from cache', slug); }
		res.redirect('/' + slug);   // reload page even if an error ocurred
	});
}

exports.subSet = function(req, res)
{
	prepare();
	showSet(res, groupSetSlug(req));
};

/**
 * @returns {string}
 */
function groupSetSlug(req)
{
	return req.params.groupSlug + '/' + req.params.partSlug;
}

/**
 * Sets still on the old blog only
 */
exports.blog = function(req, res)
{
	var slug = req.params.slug.replace(/\.html?$/, '');

	if (slug in MetadataSet.blogUrl && !Format.isEmpty(MetadataSet.blogUrl[slug]))
	{
		res.redirect(Enum.httpStatus.permanentRedirect, '/' + MetadataSet.blogUrl[slug]);
	}
	else
	{
		// send to old blog
		var url = 'http://trailimage.blogspot.com/' + req.params.year + '/' + req.params.month + '/' + req.params.slug;
		log.warn('Sending %s request to %s', slug, url);
		res.redirect(Enum.httpStatus.temporaryRedirect, url);
	}
};

function notReady(res)
{
	var retrySeconds = Setting.retryDelay / Enum.time.second;

	log.warn('Meta not ready. Trying again in %d seconds.', retrySeconds);

	res.set('Retry-After', retrySeconds);
	res.render('503',
	{
		'title': 'Image Service is not Responding',
		'setting': Setting,
		'wait': retrySeconds,
		'layout': 'layouts\\blank'
	});
}

function showSet(res, slug, template)
{
	var reply = output.responder(slug, res, 'text/html');
	/** @type {MetadataSet} */
	var set = null;

	reply.send(function(sent)
	{
		if (sent) { return; }

		if (metadata == null) { notReady(res); return; }

		set = metadata.setWithSlug(slug);

		if (set == null) { reply.notFound(slug); return; }

		flickr.getSet(set.id, sizes, function(setPhotos, setInfo)
		{
			if (template === undefined) { template = 'set'; }

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

			if (set.id != Setting.flickr.poemSet && set.id != Setting.flickr.favoriteSet)
			{
				video = getVideoMetadata(setInfo);
				dateTaken = getDateTaken(setPhotos.photo);
				map = getMapCoordinates(setPhotos.photo);
				keywords = getKeywords(setPhotos);
				description = getDescription(setInfo, setPhotos.photo, video);
			}

			reply.render(template,
			{
				'set': setPhotos,
				'info': setInfo,
				'keywords': keywords,
				'meta': set,
				'map': (Format.isEmpty(map)) ? null : encodeURIComponent('size:tiny' + map),
				'dateTaken': dateTaken,
				'video': video,
				'title': setInfo.title._content,
				'slug': slug,
				'description': description,
				'setting': Setting
			},
			function(text)
			{
				return htmlMinify(text,
				{
					removeComments: false,
					collapseWhitespace: false,
					removeEmptyAttributes: true
				});
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
 * @param {Array.<Flickr.PhotoSummary>} photos
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
 * Get unique list of tags used on photos in the set
 * @param {Flickr.SetPhotos} set
 * @return {String}
 */
function getKeywords(set)
{
	/** @type {Array.<Flickr.PhotoSummary>} */
	var photos = set.photo;
	/** @type {Array.<String>} */
	var tags = [];
	/** @type {Array.<String>} */
	var photoTags = [];

	for (var i = 0; i < photos.length; i++)
	{
		var t = photos[i].tags.split(' ');
		photoTags = [];

		for (var j = 0; j < t.length; j++)
		{
			var tag = metadata.photoTags[t[j]];     // lookup original tag name

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
 * @param {Array.<Flickr.PhotoSummary>} photos
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
 * @param {Array.<Flickr.PhotoSummary>} photos
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