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
	$photos.find('.mobile-button').on('touchstart', function() {
		var $m = $(this);
		var $fig = $m.parent();
		var content = $m.html();

		$m.addClass('loading').html(iconHtml('hourglass', '…'));

		$('<div />')
			.addClass('mobile-info')
			.load($fig.data('exif'), function() {
				var $info = $(this);
				$m.hide().removeClass('loading').html(content);
				$info
					.appendTo($fig)
					.one('touchstart', function(event) {
						event.stopPropagation();
						event.preventDefault();
						$info.hide();
						$m.show();
					});
			});
	});
	$photos.find('.info-button').one('mouseover', function() {
		var $button = $(this);
		$button
			.addClass('loading')
			.html(iconHtml('download', 'Loading …'))
			.load($button.parent().data('exif'), function() {
				$button.removeClass('loading').addClass('loaded');
			});
	});

	function iconHtml(name, text) {
		return '<span class="glyphicon glyphicon-' + name + '"></span><p>' + text + '</p>'
	}

	/**
	 * Simple light box for clicked image
	 * Post image has HTML data attributes defining the big image URL and dimensions
	 * @param {MouseEvent} event
	 */
	function lightBox(event) {
		/** @type {jQuery} Post image */
		var $img = $(this);
		/** @type {jQuery} Big image */
		var $big = $lb.find('img');
		/** @type {Boolean} Whether big image is already browser cached */
		var loaded = $img.data('big-loaded');
		/** @type {PhotoSize} */
		var size = new Size($img.data('big-width'), $img.data('big-height'));

		/**
		 * Update image position and panning speed to accomodate window size
		 * @param {MouseEvent} event
		 */
		var updateSize = function(event) {
			var cursor = 'zoom-out';

			size.update();

			if (size.needsToPan) {
				cursor = 'move';
				$lb.on('mousemove', updatePosition);
			} else {
				$lb.off('mousemove', updatePosition);
			}
			// set initial position
			updatePosition(event);
			$big.css('cursor', cursor);
		};

		/**
		 * Update image position within light box
		 * @param {MouseEvent} event
		 */
		var updatePosition = function(event) {
			$big.css({
				top: size.height.CSS(event.clientY), left: size.width.CSS(event.clientX)
			});
		};

		if (loaded === undefined) { loaded = false; }

		if (loaded) {
			// assign directly if big image has already been loaded
			$big.attr('src', $img.data('big'));
		} else {
			// assign lower resolution image while the bigger one is loading
			$big.attr('src', $img.data('original'));
			// load photo in detached element
			$('<img />')
				.bind('load', function() {
					// assign big image to light box once it's loaded
					$big.attr('src', this.src);
					$img.data('big-loaded', true);
				})
				.attr('src', $img.data('big'));
		}

		$big.height(size.height.image).width(size.width.image);

		// position based on initial click
		updateSize(event);

		$lb.show(0, disablePageScroll);
		// update panning calculations if window resizes
		$(window).resize(updateSize);
	}

	function disablePageScroll() { $('html').css('overflow', 'hidden'); }

	function enablePageScroll() {
		$('html').css('overflow', 'auto');
		$(window).off('resize');
	}

// - PhotoSize classes -------------------------------------------------------------

	/**
	 *
	 * @param {String} imageWidth
	 * @param {String} imageHeight
	 * @constructor
	 */
	function Size(imageWidth, imageHeight) {
		/** @type {Length} */
		this.width = new Length(imageWidth);
		/** @type {Length} */
		this.height = new Length(imageHeight);
		/**
		 * Whether image needs to pan
		 * @type {Boolean}
		 */
		this.needsToPan = false;
	}

	/**
	 * @param {String} forImage
	 *
	 *  ╔════════╤════════════════╗
	 *  ║        │ extra          ║
	 *  ║   ╔════╧═══╤════════╗   ║
	 *  ║   ║        │ from   ║   ║
	 *  ║   ║        ┼ center ║   ║
	 *  ║   ║ window          ║   ║
	 *  ║   ╚═════════════════╝   ║
	 *  ║ image                   ║
	 *  ╚═════════════════════════╝
	 *  Pan ratio maps mouse position from window center to the number of pixels
	 *  to offset against the image overlap
	 *
	 * @constructor
	 */
	function Length(forImage) {
		/**
		 * Image edge length
		 * @type {Number}
		 */
		this.image = parseInt(forImage);
		/**
		 * Window edge length
		 * @type {Number}
		 */
		this.window = 0;
		/**
		 * How much longer is window edge (usually a negative number)
		 * @type {Number}
		 */
		this.extra = 0;
		/**
		 * Ratio of mouse to image movement pixels for panning
		 * @type {Number}
		 */
		this.panRatio = 0;
	}

	/**
	 * Update window dimension and calculate how much larger it is than image
	 * @param {Number} forWindow
	 */
	Length.prototype.update = function(forWindow) {
		this.window = forWindow;
		this.extra = (this.window - this.image) / 2;
	};

	/**
	 * Calculate ratio for this dimension
	 * Leading number is factor by which to accelerate panning so edge of image is visible before
	 * cursor reaches edge of window
	 * @return {Number}
	 */
	Length.prototype.ratio = function() {
		return 2 * ((this.window - this.image) / this.window);
	};

	/**
	 * Get CSS image offset based on mouse position
	 * @param {Number} m
	 * @returns {String}
	 */
	Length.prototype.CSS = function(m) {
		var subtract = (this.extra > 0) ? 0 : ((this.window / 2) - m) * this.panRatio;
		return (this.extra - subtract).toFixed(0) + 'px';
	};

	/**
	 *
	 */
	Size.prototype.update = function() {
		this.height.update(window.innerHeight);
		this.width.update(window.innerWidth);
		this.needsToPan = this.width.extra < 0 || this.height.extra < 0;

		if (this.needsToPan) {
			// pan image using length with biggest ratio
			// or if one dimension needs no panning then use the other dimension
			this.height.panRatio = this.width.panRatio = (this.width.extra < this.height.extra && this.width.extra < 0)
				? this.width.ratio()
				: this.height.ratio();
		}
	};
});