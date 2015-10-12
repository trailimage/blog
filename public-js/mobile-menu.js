'use strict';

$(function() {
	var $button = $('#mobile-menu-button');
	var $menu = $('#mobile-menu');
	var $tags = $menu.find('.tags');
	var $down = $menu.find('.glyphicon-chevron-down');
	var tagHeight = $tags.height();
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

		var css = 'selected';
		var $tagList = $menu.find('.tag-list li');
		var $down = $menu.find('.glyphicon-chevron-down');

		$menu.find('.close').click(function() { $menu.hide(0, function() { visible = false; }); });

		// make initial selection
		$tags.find('ul.' + selection).show(0, toggleArrow);
		$tagList.filter('li.' + selection).addClass(css);

		$tagList.click(function() {
			var $tag = $(this);
			var tagClass = $tag.attr('class');

			$down.hide();
			$tags.find('ul').hide();
			$tags.find('ul.' + tagClass).show(0, toggleArrow);
			$tagList.removeClass(css);
			$tag.addClass(css);
			saveMenuSelection(tagClass);
		});

		prepared = true;
	}

	/**
	 * Show down arrow if list of tags exceeds display area
	 */
	function toggleArrow() {
		if ($(this).height() > tagHeight) {	$down.show(); }
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