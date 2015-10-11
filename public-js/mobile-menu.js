'use strict';

$(function() {
	var css = 'selected';
	var $button = $('#mobile-menu-button');
	var $menu = $('#mobile-menu');
	var prepared = false;
	var visible = false;

	$button.click(function() {
		if (visible) {
			$menu.hide(0, function() { visible = false; });
		} else {
			$menu.show(0, prepare);
		}
	});

	function prepare() {
		visible = true;
		if (prepared) { return; }

		$menu.find('.close').click(function() { $menu.hide(0, function() { visible = false; }); });

		prepared = true;
	}
});