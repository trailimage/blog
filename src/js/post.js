'use strict';

/**
 * Set up lazy loading and light box for post images
 * Depends on post images having data-original, data-big, data-big-width and data-big-height attributes
 * @see http://www.appelsiini.net/projects/lazyload
 */
$(function() {
	var $photos = $('figure');
	var $lb = $('#light-box');

	$lb.on('click', function() { $lb.off('mousemove').hide(0, enablePageScroll); });
	$photos.find('img').on('click', lightBox).lazyload();
	$photos.find('.mobile-button').on('click', function() { showExif.call(this); });
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
	 * Show simple light box for clicked image
	 */
	function lightBox(event) {
		var $img = $(this);           // post image
		var $big = $lb.find('img');   // light box image
		var loaded = $img.data('big-loaded');
		var width = parseInt($img.data('big-width'));
		var height = parseInt($img.data('big-height'));
		/**
		 * Update image position within light box
		 * @param {MouseEvent} event
		 */
		var updatePosition = function(event) {
			$big.css({
				top: topFromEvent(height, event),
				left: leftFromEvent(width, event)
			});
		};

		if (loaded === undefined) { loaded = false; }

		if (loaded) {
			// assign directly if big image has already been loaded
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

		$big.height(height).width(width);
		// position based on initial click
		updatePosition(event);
		// set up panning within light box
		$lb.show(0, disablePageScroll).on('mousemove', updatePosition);
	}

	/**
	 * Position of lightbox image based on mouse
	 * @param {Number} height Image height
	 * @param {MouseEvent} event
	 * @returns {String}
	 */
	function topFromEvent(height, event) {
		return positionFromEvent(event.clientY, window.innerHeight, height);
	}

	/**
	 * Position of lightbox image based on mouse
	 * @param {Number} width Image width
	 * @param {MouseEvent} event
	 * @returns {String}
	 */
	function leftFromEvent(width, event) {
		return positionFromEvent(event.clientX, window.innerWidth, width);
	}

	/**
	 * Function simplified from
	 *   lengthDiff = (w - i) / 2
	 *   ratio = lengthDiff / (w / 2)
	 *   fromCenter = (w / 2) - m
	 *   offset = lengthDiff - (fromCenter * ratio)
	 * @param {Number} m Mouse position
	 * @param {Number} w Window dimension
	 * @param {Number} i Image dimension
	 * @returns {String}
	 */
	function positionFromEvent(m, w, i) {
//		console.log('fromCenter: ' + fromCenter + ', diff: ' + diff + ', offset: ' + offset + ', alt: ' + alt);
		return (m - ((m * i) / w)).toFixed(0) + 'px';
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