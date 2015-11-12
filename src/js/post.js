'use strict';

/**
 * @see http://www.appelsiini.net/projects/lazyload
 */
$(function() {
	// setup EXIF and map mouse-overs and lazy-loading
	var $photos = $('figure');
	var $lb = $('#light-box');

	$lb.on('click', function() { $lb.off('mousemove').hide(0, enablePageScroll); });
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
	function lightBox(event) {
		var $img = $(this);           // post image
		var $big = $lb.find('img');   // light box image
		var loaded = $img.data('big-loaded');
		var width = parseInt($img.data('big-width'));
		var height = parseInt($img.data('big-height'));

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
		$big.height(height).width(width).css({
			top: topFromEvent(height, event) + 'px',
			left: leftFromEvent(width, event) + 'px'
		});

		// set up panning
		$lb.show(0, disablePageScroll).on('mousemove', function(event) {
			$big.css({
				top: topFromEvent(height, event) + 'px',
				left: leftFromEvent(width, event) + 'px'
			});
		});
	}

	function topFromEvent(height, event) {
		var ratio = ((event.clientY / window.innerHeight));
		return ((window.innerHeight - height) * ratio).toFixed(0);
	}
	function leftFromEvent(width, event) {
		var ratio = ((event.clientX / window.innerWidth));
		return ((window.innerWidth - width) * ratio).toFixed(0);
	}

	function disablePageScroll() { $('html').css('overflow', 'hidden'); }
	function enablePageScroll() { $('html').css('overflow', 'auto'); }

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