'use strict';

var ti = {
	timer: 0,
	/** @type {google.maps.Map} */
	map: null,
	/** @type {google.maps.LatLngBounds} */
	bounds: null,
	miles: 0,
	hours: 0,
	topSpeed: 0,
	avgSpeed: 0,
	count: 0,
	geo: null
};

/**
 * mapSlug and mapPhotoID are supplied by map.hbs
 * @type {Number} mapPhotoID
 * @type {String} mapSlug
 */
google.maps.event.addDomListener(window, 'load', function() {
	var canvas = document.getElementById('map-canvas');
	var preview = new google.maps.InfoWindow();
	var selected = null;

	ti.bounds = new google.maps.LatLngBounds();
	ti.map = new google.maps.Map(canvas, { mapTypeId: google.maps.MapTypeId.HYBRID });

	/**
	 * @see https://developers.google.com/maps/documentation/javascript/datalayer#style_options
	 * @see https://developers.google.com/maps/documentation/javascript/symbols
	 * @see http://mapicons.nicolasmollet.com/
	 */
	ti.map.data.setStyle(function(feature) {
		if (parseInt(feature.getProperty('id')) == mapPhotoID)	{ selected = feature; }

		return {
			icon: '/img/blue-marker.png',
			label: 'test',
			clickable: (feature.getGeometry() instanceof google.maps.Data.Point),
			strokeWeight: 2,
			strokeColor: 'red'
		};
	});

	ti.map.data.addListener('addfeature', function(event) {
		clearTimeout(ti.timer);

		ti.geo = event.feature.getGeometry();

		var speed = 0;

		extend(ti.bounds, ti.geo);

		if (ti.geo instanceof google.maps.Data.LineString || ti.geo instanceof google.maps.Data.MultiLineString) {
			ti.count++;
			ti.miles += event.feature.getProperty('distance');
			ti.hours += event.feature.getProperty('duration');

			speed = parseFloat(event.feature.getProperty('topSpeed'));

			if (speed > ti.topSpeed) { ti.topSpeed = speed; }

			speed = parseFloat(event.feature.getProperty('avgSpeed'));

			ti.avgSpeed = ((ti.avgSpeed * (ti.count - 1)) + speed) / ti.count;
		}

		ti.timer = setTimeout(function() {
			ti.map.fitBounds(ti.bounds);

			var $summary = $('#summary');

			if (ti.miles > 0) {
				$summary.show();
				$('#distance').html(ti.miles.toFixed(1));
				$('#duration').html(hoursAndMinutes(ti.hours));
				$('#top-speed').html(ti.topSpeed.toFixed(1));
				$('#avg-speed').html(ti.avgSpeed.toFixed(1));
			} else {
				$summary.hide();
			}

			if (selected) { showPhoto(selected, preview); }
		},
		200);
	});

	/** @see https://developers.google.com/maps/documentation/javascript/examples/layer-data-dragndrop */
	ti.map.data.addListener('click', function(event) {	showPhoto(event.feature, preview); });

	ti.map.data.addListener('mouseover', function(event) {
		ti.map.data.overrideStyle(event.feature, { icon: '/img/camera-marker.png' });
	});

	ti.map.data.addListener('mouseout', function(event) {
		ti.map.data.revertStyle();
	});

	ti.map.data.loadGeoJson('/' + mapSlug + '/geo.json');
});

/**
 * @param {google.maps.Data.Feature} feature
 * @param {google.maps.InfoWindow} modal
 */
function showPhoto(feature, modal) {
	if (modal && feature) {
		var image = feature.getProperty('preview');
		var id = feature.getProperty('id');
		var geo = feature.getGeometry();
		var partSlug = feature.getProperty('partSlug');

		modal.setOptions({
			content: '<a href="/' + (partSlug || mapSlug) + '#' + id + '"><img src="' + image + '"/></a>',
			position: geo.get()
		});
		modal.open(ti.map);
	}
}

function loadPostTrack(newSlug) {
	ti.map.data.forEach(function(f) { ti.map.data.remove(f); });

	mapSlug = newSlug;
	ti.miles = 0;
	ti.hours = 0;
	ti.topSpeed = 0;
	ti.avgSpeed = 0;
	ti.count = 0;
	ti.bounds = new google.maps.LatLngBounds();

	window.history.pushState(null, null, '/' + mapSlug + '/map');

	ti.map.data.loadGeoJson('/' + mapSlug + '/geo.json');
}

function hoursAndMinutes(hours) {
	var h = Math.floor(hours);
	var m = (Math.round(60 * (hours - h))).toString();

	if (m.length < 2) { m = '0' + m; }

	return h + ':' + m;
}

/**
 * Update a map's viewport to fit each geometry in a dataset
 * @param {google.maps.LatLngBounds} bounds
 * @param {google.maps.Geometry|google.maps.Point} geometry coordinates to apply
 */
function extend(bounds, geometry) {
	if (geometry instanceof google.maps.LatLng) {
		bounds.extend(geometry);
	} else if (geometry instanceof google.maps.Data.Point) {
		bounds.extend(geometry.get());
	} else {
		geometry.getArray().forEach(function(g) { extend(bounds, g); });
	}
}