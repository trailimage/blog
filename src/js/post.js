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
	$photos.find('img').on('click', lightBox);
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

	/**
	 * Show light box for clicked image
	 */
	function lightBox() {
		var $img = $(this);           // post image
		var $big = $lb.find('img');   // light box image

		$big
			.attr('src', $img.attr('src'))
			.height($img.data('big-height'))
			.width($img.data('big-width'));
		$lb.show();

		// create detached image element to pre-load big
		$('<img />')
			.bind('load', function() {
				// re-assign big image to light box once it's loaded
				$big.attr('src', this.src);
			})
			.attr('src', $img.data('big'));
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