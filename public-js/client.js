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
		selection = loadMenuSelection(['When', null]);

	for (var root in menu)
	{
		var $li = $('<li>').text(root);
		$rootList.append($li);
		if (root == selection[0]) { $li.addClass(css); loadTags(selection); }
	}

	$title.click(function(e)
	{
		var $up = $title.find('.glyphicon-chevron-up');
		var $down = $title.find('.glyphicon-chevron-down');
		var $menu = $('#menu');

		if ($title.hasClass(css))
		{
			$title.removeClass(css); $menu.hide(); $up.hide(); $down.show();
		}
		else
		{
			$title.addClass(css); $menu.show(); $up.show(); $down.hide();
		}
	});

	$rootList.on('click', 'li', function(e)
	{
		var $li = $(this);
		selection = [$li.text(), null];
		menuSelect($rootList, $li, loadTags, selection);
	});

	$tagList.on('click', 'li', function(e)
	{
		var $li = $(this);
		selection[1] = $li.text();
		menuSelect($tagList, $li, loadPosts, selection);
	});

	$postList.on('click', 'li', function(e)
	{
		window.location.href = '/' + $(this).data('slug');
	});
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
	/** @type {menu.Tag[]} */
	var tags = menu[selection[0]];

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
	/** @type {menu.Tag[]} */
	var tags = menu[selection[0]];

	$postList.empty();

	for (var i = 0; i < tags.length; i++)
	{
		if (tags[i].title == selection[1])
		{
			var posts = tags[i].items;

			for (var j = 0; j < posts.length; j++)
			{
				$postList.append($('<li>')
					.html('<span class="mode-icon ' + posts[j].icon + '"></span>' + posts[j].title)
					.data('slug', posts[j].slug));
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