var _ads = {
	enabled: false,
	maxWidth: 160,
	padding: 20
}
var _library = null;

if (!Array.indexOf)
{
	Array.prototype.indexOf = function(obj, start)
	{
		for (var i = (start || 0); i < this.length; i++)
		{
			if (this[i] == obj) { return i; }
		}
		return -1;
	}
}
Date.prototype.format = function()
{
	var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return month[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
}
String.prototype.toDate = function()
{
	// 2011-05-25T11:00:00.001-06:00
	var match = /(\d{2,4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(this);
	return new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
}

$(window).load(function() {
	if (_ads.enabled)
	{
		var layout = new layoutObject();
		layout.calculate();
	}
});

$(function()
{
	// caption style
	$('div.photo p')
		.css('margin-top', '-21px')
		.css('border-bottom', 'none')
		.wrapInner('<span/>');
	
	// image enlargement
	$('div.photo img').attr('title','Click to view larger at FlickrAPI.com').click(function()
	{
		var $img = $(this);
		var url = $img.data('url')
		if (url) {
			location.href = url;
		} else {
			var match = $img.attr('src').match(/\/(\d{8,10})_/);
			if (match) {
				flickr.getSizes(match[1], function(r) {
					if (r && r.sizes) {
						var p = r.sizes.size[r.sizes.size.length - 1];
						$img.data('url', p.source);
						location.href = p.source;
					}
				});
			}
		}
	});
	
	// index and contents
	$('#toc-tabs li').click(function(event)
	{
		var css = 'tab-selected';
		var tabs = $(this).addClass(css).attr('rel').split('|');
		$('#' + tabs[0]).showAll();
		$('#' + tabs[1]).hide();
		$('#tag-match-table').hide();
		$('[rel="' + tabs[1] + '|' + tabs[0] + '"]').removeClass(css);
	});
	
	// tag (label) search
	var $matches = $('#tag-match-table');
	
	$('#tag-table td a').click(function(event)
	{
		event.preventDefault();
		var url = $(this).attr('href');
		if (window.location.hostname == 'localhost')
		{
			url = 'http://blog.trailimage.com' + url;
		}
		$.ajax({
			url: url,
			dataType: 'jsonp',
			jsonp: false,
			jsonpCallback: 'loadTags',
			success: loadTags
		});
	});
	
	
});

function loadTags(json)
{
	var url = getLinkUrl(json.feed, 'alternate');
	var name = unescape(url.substr(url.lastIndexOf('/') + 1));
	var tag = new tagObject();
		
	for (var i = 0; i < json.feed.entry.length; i++)
	{
		tag.add(json.feed.entry[i]);
	}
	var $matches = $('#tag-match-table');
	var $tagList = $('#tag-table');
	
	$matches.empty().append(
		$('<tr>')
			.append($('<th>').html(name).append($('<span>').html(' trips')))
			.append($('<th>').addClass('date').append(
				$('<a>')
					.text('close')
					.click(function() { $matches.hide(); $tagList.showAll(); })
			)
		)
	);
	tag.toHtml($matches);
	$matches.showAll();
	$tagList.hide();
}

// invoked by feed callback
// http://www.consumingexperience.com/2008/07/blogger-unofficial-feed-faq.html
function loadLibrary(json)
{
	$(function()
	{
		_library = new libraryObject();
		
		for (var i = 0; i < json.feed.entry.length; i++)
		{
			_library.add(json.feed.entry[i]);
		}
		
		$('h2.post-title').each(function()
		{
			var story = _library.get(this.innerHTML);
			if (!story)
			{
				$('div.post-author,div.post-date').hide();
				return;
			}
			var chapters = story.chapter.length;
			var i = (story && chapters > 1) ? story.indexOf(this.innerHTML) : 1;
			var chapter = story.chapter[i - 1];
			var subtitle = chapter.title;
			var p = ['div.previous a','.prev-text'];
			var n = ['div.next a','.next-text','.next-title'];
			
			if (subtitle)
			{
				if (chapters > 1 && !/\d$/.test(subtitle))
				{
					subtitle = '<span class="part-prefix">Part ' + i + ':</span>' + subtitle;
				}
				$(this)
					.empty()
					.append(story.title)
					.append($('<div>').addClass('subtitle').html(subtitle));
			}
				
			if (i > 1) {							// previous chapter of same story
				updateNavigation(p, story, i - 1, true);
			} else {								// previous story
				updateNavigation(p, story.previous, 1);
			}
			if (i < chapters && chapters > 1) {		// next chapter of same story
				updateNavigation(n, story, i + 1, true);
			} else {								// next story
				updateNavigation(n, story.next, 1);
			}
		});
		_library.toHtml($('#contents-table'));
	});
}

function updateNavigation(selector, story, index, relative)
{
	if (!story) { return; }
	var chapter = story.chapter[index - 1];
	var fullTitle =  story.fullTitle(index);
	var numbered = /\d$/.test(chapter.title);
	var text = null;

	$(selector[0]).each(function()		// link
	{
		this.setAttribute('title', fullTitle);
		this.setAttribute('href', chapter.url);
	});
	if (relative)						// text
	{
		text = (numbered) ? chapter.title : 'Part ' + index;
		$(selector[1]).each(function() { $(this).html(text); });
	}
	if (selector.length > 2)			// title
	{
		text = (relative && !numbered) ? chapter.title : story.title;
		$(selector[2]).each(function() { $(this).html(text); });
	}
}

function libraryObject()
{
	var _library = this;
	var _story = new Object();
	var _lastStory = null;
	
	this.add = function(entry)
	{
		var date = entry.published.$t.toDate();
		var url = getLinkUrl(entry, 'alternate');
		var part = _library.titleParts(entry.title.$t);
		var title = part[0];
		var subtitle = part[1];
		var match = entry.summary.$t.match(/_[^_]+_/g);
		var summary = null;
		
		if (match) { summary = match[0].replace(/_/g, ""); }
		
		if (title in _story)
		{
			_story[title].add(subtitle, summary, url, date);
		}
		else
		{
			_story[title] = new storyObject(title, subtitle, summary, url, date);
			
			if (_lastStory)
			{
				_lastStory.previous = _story[title];
				_story[title].next = _lastStory;
			}
			_lastStory = _story[title];
		}
	}
	this.get = function(title) { return _story[_library.titleParts(title)[0]]; }
	this.each = function(fn) { for (title in _story) { fn(_story[title]); }	}
	this.toHtml = function($table)
	{
		for (title in _story) { _story[title].toHtml($table); }
	}
	
	function storyObject(title, subtitle, summary, url, date)
	{
		var _this = this;
		this.chapter = [new chapterObject(subtitle, url, date)];
		this.title = title;
		this.summary = summary;
		this.next = null;
		this.previous = null;
		this.date = function() { return _this.chapter[0].date.format();	}
		this.url = function() { return _this.chapter[0].url; }
		this.link = function()
		{
			var a = document.createElement('a');
			a.href = _this.url();
			a.innerHTML = _this.title;
			if (_this.summary)
			{
				var $summary = $('#header-summary');
				$(a).hover(
					function() { $summary.html(_this.summary).showAll(); },
					function() { $summary.hide().empty(); }
				)
			}
			return a;
		}
		this.each = function(fn)
		{
			for (var i = 0; i < _this.chapter.length; i++) { fn(_this.chapter[i]); }
		}
		this.indexOf = function(title)
		{
			var subtitle = _library.titleParts(title)[1];
			if (subtitle)
			{
				for (var i = 0; i < this.chapter.length; i++)
				{
					if (this.chapter[i].title == subtitle) { return i + 1; }
				}
			}
			else
			{
				return -1;
			}
		}
		this.add = function(subtitle, summary, url, date)
		{
			_this.summary = summary;
			_this.chapter.unshift(new chapterObject(subtitle, url, date));
			makeRelative();
		}
		this.fullTitle = function(index)
		{
			if (!index) { index = 1; }
			return (_this.chapter.length > 1)
				? _this.title + ': ' + _this.chapter[index - 1].title
				: _this.title;
		}
		this.toHtml = function($table)
		{
			var $title = $('<td>').addClass('title').append(_this.link());
			
			if (_this.chapter.length > 1)
			{
				var $span = $('<span>').addClass('chapters').appendTo($title);
				_this.each(function(chapter)
				{
					$span.append(chapter.link());
					if (!chapter.last) { $span.append(' &bull; '); }
				});
			}
			else if (_this.chapter[0].title)
			{
				$('<span>')
					.addClass('subtitle')
					.append(': ')
					.append(_this.chapter[0].title)
					.appendTo($title);
			}			
			$table.append($('<tr>')
				.append($title)
				.append($('<td>').addClass('date').html(_this.date()))
			);
		}
		function makeRelative()
		{
			for (var i = 0; i < _this.chapter.length; i++)
			{
				_this.chapter[i].first = (i == 0);
				_this.chapter[i].last = (i == _this.chapter.length - 1);
			}
		}
	}
	
	function chapterObject(title, url, date)
	{
		var _this = this;
		this.title = title;
		this.last = true;
		this.first = true;
		this.url = url;
		this.date = date;
		this.link = function()
		{
			var a = document.createElement('a');
			a.href = _this.url;
			a.innerHTML = _this.title;
			return a;
		}
	}
	
	this.titleParts = function(title)
	{
		return (title.indexOf(':') != -1) ? title.split(/:\s*/) : [title, null];
	}
}

function tagObject()
 {
	var _this = this;
	var _story = [];
	this.name = null;
	
	this.add = function(entry)
	{
		var title = entry.title.$t;
		if (!_this.contains(title)) { _story.push(_library.get(title)); }
	}
	this.toHtml = function($table)
	{
		for (var i = 0; i < _story.length; i++) { _story[i].toHtml($table); }
	}
	this.contains = function(title)
	{
		title = _library.titleParts(title)[0];
		for (var i = 0; i < _story.length; i++)
		{
			if (_story[i].title == title) { return true; }
		}
		return false;
	}
}

function layoutObject()
 {
	var _this = this;
	var spaces = [];
	
	this.calculate = function()
	{
		var top = $('#toc-tabs').outerHeight(true) + $('#toc-tabs').offset().top;
		var maxOverflow = (edge('#page') - edge('#content')) - _ads.maxWidth;
		var maxWidth = $('#content').width() + (maxOverflow / 2);
		
		$('div.photo img').each(function()
		{
			var $img = $(this);
			if ($img.outerWidth() > maxWidth) {
				var bottom = $img.offset().top;
				if (bottom > top) {
					spaces.push(new spaceObject(top, bottom));
					top = bottom + $img.outerHeight();
				}
			}
		});
		
		$('div.gas').each(function()
		{
			var match = /gas(\d+)x(\d+)/.exec(this.id);
			var s = firstFit((match[2] * 1) + _ads.padding * 2);
			if (s)
			{
				s.available = false;
				$(this).css('top', s.top + 'px').showAll();
			}
		});
	}
	
	function edge(selector)
	{
		var $node = $(selector);
		return $node.offset().left + $node.width();
	}
	
	function firstFit(height)
	{
		for (var i = 0; i < spaces.length; i++)
		{
			if (spaces[i].available && spaces[i].canFit(height)) { return spaces[i]; }
		}
		return null;
	}
	
	function spaceObject(t, b)
	{
		var _this = this;
		this.top = t;
		this.bottom = b;
		this.available = true;
		this.canFit = function(height)
		{
			return (_this.bottom - _this.top) > height;
		}
	}

}

function getLinkUrl(feed, relation)
{
	for (var i = 0; i < feed.link.length; i++)
	{
		if (feed.link[i].rel == relation)
		{
			return feed.link[i].href;
		}
	}
	return null;
}

var flickr = {
	url: {
		api: 'http://api.flickr.com/services/rest/',
		requestToken: 'http://www.flickr.com/services/oauth/request_token',
		authorize: 'http://www.flickr.com/services/oauth/authorize',
		accessToken: 'http://www.flickr.com/services/oauth/access_token'
	},
	parameters: [
		['format','json']
	],
	consumer: new tokenObject('459e62a3f2bcd299cd8fe8a58b8d1fb6', '135678bbdb34a901', true),
	token: new tokenObject('72157627976606614-b5db2d0f565b3d26', 'd1dbbbf8c34b6c3b', true),
	service: function(url, p, callback)
	{
		var $xhr = $.ajax({
			url: url,
			cache: true,	// oauth timestamp already disables cache
			dataType: 'jsonp',
			jsonp: false,
			jsonpCallback: 'jsonFlickrApi',
			beforeSend: function(xhr, settings)
			{
				xhr.overrideMimeType('application/json');
				settings.url = flickr.sign(settings.url, p);
			},
			success: callback,
			error: function(xhr, status, ex) { alert(status); }
		});
	},
	sign: function(url, p)
	{
		p = p || [];
		p.push(['oauth_callback','oob']);
		var message = { action: url, parameters: p };
		var accessor = {
			consumerKey: flickr.consumer.key,
			consumerSecret: flickr.consumer.secret,
			token: flickr.token.key,
			tokenSecret: flickr.token.secret
		}
		OAuth.completeRequest(message, accessor);
		//console.log(OAuth.SignatureMethod.getBaseString(message));
		return url + '?' + OAuth.formEncode(message.parameters);
	},
	isAuthorized: function()
	{
		if (flickr.token.isValid())
		{
			return true;
		}
		else
		{
			if (flickr.token.isEmpty())					// need to request token (1)
			{				
				flickr.open(flickr.url.requestToken);
			}
			else if (flickr.token.isVerified())			// exchange validated token (3)
			{		
				flickr.open(flickr.url.accessToken, [['oauth_verifier', flickr.token.verifier]]);
			}
			else if (flickr.token.isTemporary())		// need to validate token (2)
			{	
				flickr.open(flickr.url.authorize, [['perms', 'read']]);
			}
			return false;
		}
	},
	getSizes: function(id, callback)
	{
		if (flickr.isAuthorized())
		{
			var p = [
				['format','json'],
				['method', 'flickr.photos.getSizes'],
				['photo_id', id]
			];
			flickr.service(flickr.url.api, p, callback);
		}
	},
	open: function(url, p) { window.open(flickr.sign(url, p), '_blank'); }
};

function tokenObject(key, secret, permanent, verifier)
{
	var _permanent = (permanent);
	this.key = key;
	this.secret = secret;
	this.verifier = verifier;
	this.isPermanent = function() { return _permanent; }
	this.isVerified = function() { return (this.verifier); }
	this.isTemporary = function() { return !_permanent; }
	this.isEmpty = function()
	{
		return (this.key == null && this.secret == null);
	}
	this.isValid = function()
	{
		return (this.isPermanent() && !this.isEmpty());
	}
}