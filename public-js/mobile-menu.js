'use strict';

$(function() {
	var css = 'selected';
	var $button = $('#mobile-menu-button');
	var $menu = $('#mobile-menu');
	var $tags = null;
	var $tagList = null;
	var prepared = false;
	var visible = false;
	var selection = loadMenuSelection('when');

	$button.click(function() {
		if (visible) {
			$menu.hide(0, function() { visible = false; });
		} else {
			$menu.show(0, prepare);
		}
	});

	/**
	 * Wire menu events
	 */
	function prepare() {
		visible = true;
		if (prepared) { return; }

		$tags = $menu.find('.tags');
		$tagList = $menu.find('.tag-list li');
		$menu.find('.close').click(function() { $menu.hide(0, function() { visible = false; }); });

		console.log($tagList.find('li.' + selection));

		// make initial selection
		$tags.find('ul.' + selection).show();
		$tagList.filter('li.' + selection).addClass(css);

		$tagList.click(function() {
			var $tag = $(this);
			var tagClass = $tag.attr('class');
			$tags.find('ul').hide();
			$tags.find('ul.' + tagClass).show();
			$tagList.removeClass(css);
			$tag.addClass(css);
			saveMenuSelection(tagClass);
		});

		prepared = true;
	}

	/**
	 * @param {String} ifNone Tag to load if no cookie is found
	 * @returns {String}
	 */
	function loadMenuSelection(ifNone) {
		var re = new RegExp('\\bmobile=([^;\\b]+)', 'gi');
		var match = re.exec(document.cookie);
		return (match === null) ? ifNone : match[1];
	}

	/**
	 * @param {String} selected
	 */
	function saveMenuSelection(selected) { document.cookie = 'mobile=' + selected; }
});