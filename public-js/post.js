$(function() {
	// setup EXIF and map mouse-overs and lazy-loading
	var $photos = $('.photo');

	$photos.find('img').lazyload();
	$photos.find('.exif').mouseenter(function() {
		var $exif = $(this);
		// EXIF DIV has a data-url property for loading details
		$exif.off('mouseenter')
			 .html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>')
			 .load($exif.data('url'));
	})
});