'use strict';

$(function() {
	var css = 'selected';
	var $button = $('#mobile-menu-button');
	var $menu = $('#mobile-menu');

	$button.click(function() {
		$menu.show(function() {
			$menu.find('.close').one('click', function() {
				$menu.hide();
			});
		});
	});

	//console.log($button);

});