'use strict';

/**
 * @see http://www.appelsiini.net/projects/lazyload
 */
$(function() {
	// setup EXIF and map mouse-overs and lazy-loading
	var $photos = $('figure');
	var $lb = $('#light-box');

	$lb.on('click', function() { $lb.hide(); });
	$photos.find('img').lazyload();
	$photos.find('img').on('click', function() {
		var $img = $(this);
		$lb.find('img').attr('src', $img.data('enlarge'));
		$lb.show();
	});
	$photos.find('.mobile-button').on('click', function() {
		showExif.call(this);
	});
	$photos.find('.exif-button').on('mouseover', function() {
		showExif.call(this, true);

		var $exif = $(this);

		$exif.parent().append($('<div>')
			.addClass('exif')
			.html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
			.load($exif.data('url'))
		);
		// EXIF DIV has a data-url property for loading details
		//$exif.off('mouseenter click')
		//	.addClass('loading')
		//	.html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
		//	.load($exif.data('url'), function() {
		//		$exif.removeClass('loading').addClass('loaded');
		//	});
	});

	function repload() {

	}

	/**
	 * @param {Boolean} [removeButton] Whether to remove button after showing EXIF
	 */
	function showExif(removeButton) {
		var $button = $(this);
		var $photo = $button.parent();
		var url = $photo.data('exif');

		$exif.parent().append($('<div>')
				.addClass('exif')
				.html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
				.load($exif.data('url'))
		);


	}
});