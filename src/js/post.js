'use strict';

$(function() {
	// setup EXIF and map mouse-overs and lazy-loading
	var $photos = $('.photo');

	$photos.find('img').lazyload();
	$photos.find('.exif').on('mouseenter click', function() {
		var $exif = $(this);
		// EXIF DIV has a data-url property for loading details
		$exif.off('mouseenter click')
			.addClass('loading')
			.html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
			.load($exif.data('url'), function() {
				$exif.removeClass('loading').addClass('loaded');
			});
	});
});