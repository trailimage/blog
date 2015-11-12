'use strict';

/**
 * @see http://www.appelsiini.net/projects/lazyload
 */
$(function() {
	// setup EXIF and map mouse-overs and lazy-loading
	var $photos = $('figure');
	var $lb = $('#light-box');

	$lb.on('click', function() { $lb.off('mousemove').hide(); });
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
		var loaded = $img.data('big-loaded');

		if (loaded === undefined) { loaded = false; }

		if (loaded) {
			$big.attr('src', $img.data('big'));
		} else {
			// assign lower resolution image while the bigger one is loading
			$big.attr('src', $img.data('original'));

			$('<img />')
				.bind('load', function() {
					// assign big image to light box once it's loaded
					$big.attr('src', this.src);
					$img.data('big-loaded', true);
				})
				.attr('src', $img.data('big'));
		}
		$big.height($img.data('big-height')).width($img.data('big-width'));

		$lb.show().on('mousemove', function(event) {
			
		});
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