$(function() { prepareMenu(); preparePhotos(); });

function preparePhotos()
{
	var $photos = $('.photo');

	$photos.find('img').lazyload();
	$photos.find('.exif').mouseenter(function()
	{
		var $exif = $(this);
		$exif.off('mouseenter')
			 .html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
			 .load($exif.data('url'));
	});
}

function prepareMenu()
{
	var css = 'selected',
		$title = $('#menu-title'),
		$rootList = $('#menu-root'),
		$tagList = $('#menu-tag'),
		$postList = $('#menu-post'),
		$description = $('#post-description'),
		selection = loadMenuSelection(['When', null]);

	$title
		.one('click', function()
		{
			// populate menu on first click
			for (var root in TrailImage.menu)
			{
				var $li = $('<li>').text(root);
				$rootList.append($li);
				if (root == selection[0]) { $li.addClass(css); loadTags(selection); }
			}
		})
		.click(toggleMenu);

	$rootList.on('click', 'li', function()
	{
		var $li = $(this);
		selection = [$li.text(), null];
		menuSelect($rootList, $li, loadTags, selection);
	});

	$tagList.on('click', 'li', function()
	{
		var $li = $(this);
		selection[1] = $li.text();
		menuSelect($tagList, $li, loadPosts, selection);
	});

	$postList
		.on('click', 'li.post', showSelection)
		.on('mouseover', 'li.post', function() { $description.html($(this).data('description')); })
		.on('mouseout', function() { $description.empty(); })
}

function toggleMenu()
{
	// toggle menu visibility
	var css = 'selected';
	var $title = $('#menu-title');
	var $up = $title.find('.glyphicon-chevron-up');
	var $down = $title.find('.glyphicon-chevron-down');
	var $menu = $('#menu');
	var show = function() { $title.addClass(css); $menu.show(); $up.show(); $down.hide(); };
	var hide = function() { $title.removeClass(css); $menu.hide(); $up.hide(); $down.show(); };

	if ($title.hasClass(css))
	{
		hide();
	}
	else
	{
		show();
		$('.content:not(#header), .map').one('click', hide);
	}
}

function showSelection()
{
	var slug = $(this).data('slug');

	if (typeof loadPostTrack != 'undefined')
	{
		loadPostTrack(slug);
	}
	else
	{
		window.location.href = '/' + slug;
	}
	toggleMenu();
}

/**
 *
 * @param {jQuery} $list
 * @param {jQuery} $clicked
 * @param {function(string[])} loader
 * @param {String[]} selection
 */
function menuSelect($list, $clicked, loader, selection)
{
	$list.find('li').removeClass('selected');
	loader(selection);
	$clicked.addClass('selected');
	saveMenuSelection(selection);
}

/**
 * @param {String[]} selection
 */
function loadTags(selection)
{
	var $tagList = $('#menu-tag');
	/** @type {TrailImage.Tag[]} */
	var tags = TrailImage.menu[selection[0]];

	$tagList.empty();

	if (selection[1] == null) { selection[1] = tags[0].title; }

	for (var i = 0; i < tags.length; i++)
	{
		var $li = $('<li>').text(tags[i].title);
		$tagList.append($li);
		if (tags[i].title == selection[1]) { $li.addClass('selected'); loadPosts(selection); }
	}
}

function loadPosts(selection)
{
	var $postList = $('#menu-post');
	/** @type {TrailImage.Tag[]} */
	var tags = TrailImage.menu[selection[0]];

	$postList.empty();

	for (var i = 0; i < tags.length; i++)
	{
		if (tags[i].title == selection[1])
		{
			var ids = tags[i].posts;

			for (var j = 0; j < ids.length; j++)
			{
				var post = TrailImage.post[ids[j]];
				var title = post.title;

				if (post.part && j < (ids.length - 1) && title == TrailImage.post[ids[j + 1]].title)
				{
					// found part in series followed by at least one more part in the same series
					var $ol = $('<ol>');

					while (j < ids.length && TrailImage.post[ids[j]].title == title)
					{
						post = TrailImage.post[ids[j]];

						$ol.prepend($('<li>')
							.addClass('post')
							.attr('value', post.part)
							.html(post.subTitle)
							.data('description', post.description)
							.data('slug', post.slug));

						j++;
					}

					j--;

					post = TrailImage.post[ids[j]];

					$postList.append($('<li>')
						.addClass('series')
						.html('<span class="mode-icon ' + post.icon + '"></span>' + post.title)
						.append($ol));
				}
				else
				{
					// if series part is orphaned within a tag then show full title
					if (post.part) { title += ': ' + post.subTitle; }

					$postList.append($('<li>')
						.addClass('post')
						.html('<span class="mode-icon ' + post.icon + '"></span>' + title)
						.data('description', post.description)
						.data('slug', post.slug));
				}
			}
		}
	}
}

function loadMenuSelection(ifNone)
{
	var re = new RegExp('\\bmenu=([^;\\b]+)', 'gi');
	var match = re.exec(document.cookie);
	return (match == null) ? ifNone : match[1].split(',');
}

function saveMenuSelection(selection)
{
	if (typeof selection === 'string') { selection = [selection, null]; }
	document.cookie = 'menu=' + selection.join();
}