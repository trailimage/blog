$(function()
{
	prepareMenu();
	preparePhotos();
});

function preparePhotos()
{
	$photos = $('.photo');
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
	var bullet = '∙';
	var css = 'selected';
	var $title = $('#menu-title');
	var	$rootList = $('#menu-root');
	var $tagList = $('#menu-tag');
	var $postList = $('#menu-post');
	var selectedRoot = loadMenuSelection('When');

	for (var root in menu)
	{
		$rootList.append($('<li>').text(root));
		if (root == selectedRoot) { loadTags(root);	}
	}

	$title.click(function(e)
	{
		if ($title.hasClass(css))
		{
			$title.removeClass(css);
			$('#menu').hide();
			$title.find('.glyphicon-chevron-up').hide();
			$title.find('.glyphicon-chevron-down').show();
		}
		else
		{
			$title.addClass(css);
			$('#menu').show();
			$title.find('.glyphicon-chevron-up').show();
			$title.find('.glyphicon-chevron-down').hide();
		}
	});

	$rootList.on('click', 'li', function(e)
	{
		var $li = $(this);
		$rootList.find('li').removeClass(css);
		loadTags($li.text());
		$li.addClass(css);
	});

	$tagList.on('click', 'li', function(e)
	{
		var $li = $(this);
		$tagList.find('li').removeClass(css);
		loadPosts($li.data('root'), $li.text());
		$li.addClass(css);
	});

	$postList.on('click', 'li', function(e)
	{
		window.location.href = '/' + $(this).data('slug');
	});
}

function loadTags(root)
{
	var $tagList = $('#menu-tag');
	var tags = menu[root];

	$tagList.empty();

	saveMenuSelection(root);

	for (var i = 0; i < tags.length; i++)
	{
		$tagList.append($('<li>').text(tags[i].title).data('root', root));

		if (i == 0)	{ loadPosts(root, tags[i].title) }
	}
}

function loadPosts(root, tag)
{
	var $postList = $('#menu-post');
	var tags = menu[root];

	$postList.empty();

	saveMenuSelection(root + '/' + tag);

	for (var i = 0; i < tags.length; i++)
	{
		if (tags[i].title == tag)
		{
			var posts = tags[i].items;

			for (var j = 0; j < posts.length; j++)
			{
				$postList.append($('<li>').text(posts[j].title).data('slug', posts[j].slug));
			}
		}
	}
}

function loadMenuSelection(ifNone)
{
	var re = new RegExp('\\bmenu=([^;\\b]+)', 'gi');
	var match = re.exec(document.cookie);
	return (match == null) ? ifNone : match[1];
}

function saveMenuSelection(selection)
{
	document.cookie = 'menu=' + selection;
}