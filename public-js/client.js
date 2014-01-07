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

	var $setList = $('#sets'),
		$collectionList = $('#collections'),
		$photos = $('.photo'),
		key = 'root',
		root = loadSelection();

	for (var c in menu) { $collectionList.appendOption(c, c + ':'); }

	if (root)
	{
		$collectionList.val(root);
	}

	updateSets();

	$setList.change(function(e)	{ location.href = '/' + $(e.target).val(); });
	$collectionList.change(updateSets);

	$photos.find('img').lazyload();
	$photos.find('.exif').mouseenter(function()
	{
		var $exif = $(this);
		$exif.off('mouseenter').html('Loading …').load($exif.data('url'));
	});

	function updateSets()
	{
		"use strict";

		var root = $collectionList.val(),
			sub = null,
			$group = null;

		if (menu[root])
		{
			saveSelection(root);

			// http://www.cs.tut.fi/~jkorpela/chars/spaces.html
			$setList
				.empty()
				.css({borderColor: '#f40', color: '#f40'})
				.animate({borderColor: '#747e73', color: '#000'}, 600)
				.appendOption(0, '— View Another Adventure —')
				.append($('<optgroup>').addClass('note').attr('label', '     ' + bullet + 'Motorcycle Ride'));

			for (var i = 0; i < menu[root].length; i++)
			{
				sub = menu[root][i];
				$group = $('<optgroup>').attr('label', sub.title);

				for (var j = 0; j < sub.items.length; j++)
				{
					$group.appendOption(sub.items[j].slug, sub.items[j].title);
				}
				$setList.append($group);
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