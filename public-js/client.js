$(function()
{
	var bullet = '∙';

	/**
	 * @return {*|Object|!jQuery|Object|Object|!jQuery|Object}
	 */
	$.fn.appendOption = function(value, name)
	{
		return this.each(function()
		{
			var $option =$('<option>').attr('value', value).html(name);
			if (name.indexOf(bullet) == 0) { $option.addClass('bullet'); }
			$(this).append($option);
		});
	};

	var $postList = $('#posts'),
		$tagList = $('#tags'),
		$photos = $('.photo'),
		key = 'root',
		root = loadSelection();

	for (var tag in menu) { $tagList.appendOption(tag, tag + ':'); }

	if (root)
	{
		$tagList.val(root);
	}

	updateSets();

	$postList.change(function(e) { location.href = '/' + $(e.target).val(); });
	$tagList.change(updateSets);

	$photos.find('img').lazyload();
	$photos.find('.exif').mouseenter(function()
	{
		var $exif = $(this);
		$exif.off('mouseenter').html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load($exif.data('url'));
	});

	function updateSets()
	{
		"use strict";

		var root = $tagList.val(),
			sub = null,
			$group = null;

		if (menu[root])
		{
			saveSelection(root);

			// http://www.cs.tut.fi/~jkorpela/chars/spaces.html
			$postList
				.empty()
				.css({borderColor: '#f40', color: '#f40'})
				.animate({borderColor: '#747e73', color: '#000'}, 600)
				.appendOption(0, '— View Another Adventure —')
				.append($('<optgroup>').addClass('note').attr('label', '     ' + bullet + '(dot indicates motorcycle ride)'));

			for (var i = 0; i < menu[root].length; i++)
			{
				sub = menu[root][i];
				$group = $('<optgroup>').attr('label', sub.title);

				for (var j = 0; j < sub.items.length; j++)
				{
					$group.appendOption(sub.items[j].slug, sub.items[j].title);
				}
				$postList.append($group);
			}
		}
	}

	function saveSelection(root)
	{
		document.cookie = key + "=" + root;
	}

	function loadSelection()
	{
		var re = new RegExp('\\b' + key + '=([^;\\b]+)', 'gi');
		var match = re.exec(document.cookie);
		return (match == null) ? null : match[1];
	}
});