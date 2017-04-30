'use strict';

const trip = {
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
 * postKey, mapPhotoID and allowDownload are supplied by map.hbs
 * @type {number} mapPhotoID
 * @type {string} postKey
 * @type {boolean} allowDownload
 */
google.maps.event.addDomListener(window, 'load', function() {
   var canvas = document.getElementById('map-canvas');
   var preview = new google.maps.InfoWindow();
   var selected = null;

   trip.bounds = new google.maps.LatLngBounds();
   trip.map = new google.maps.Map(canvas, { mapTypeId: google.maps.MapTypeId.HYBRID });

   /**
    * @see https://developers.google.com/maps/documentation/javascript/datalayer#style_options
    * @see https://developers.google.com/maps/documentation/javascript/symbols
    * @see http://mapicons.nicolasmollet.com/
    */
   trip.map.data.setStyle(function(feature) {
      if (parseInt(feature.getId()) == mapPhotoID) { selected = feature; }

      return {
         icon: '/img/orange-marker.png',
         clickable: (feature.getGeometry() instanceof google.maps.Data.Point),
         strokeWeight: 3,
         strokeColor: '#06f',
         strokeOpacity: 0.7
      };
   });

   /**
    * Listen for features being added to the Google map
    */
   trip.map.data.addListener('addfeature', function(event) {
      window.clearTimeout(trip.timer);

      trip.geo = event.feature.getGeometry();

      var speed = 0;

      encompass(trip.bounds, trip.geo);

      if (trip.geo instanceof google.maps.Data.LineString || trip.geo instanceof google.maps.Data.MultiLineString) {
         trip.count++;
         trip.miles += event.feature.getProperty('distance');
         trip.hours += event.feature.getProperty('duration');

         // properties defined in Track.parse()
         speed = parseFloat(event.feature.getProperty('topSpeed'));

         if (speed > trip.topSpeed) { trip.topSpeed = speed; }

         speed = parseFloat(event.feature.getProperty('avgSpeed'));

         trip.avgSpeed = ((trip.avgSpeed * (trip.count - 1)) + speed) / trip.count;
      }

      /**
       * Set a timer to complete the map when all features have been added
       * @type {number}
       */
      trip.timer = window.setTimeout(function() {
         trip.map.fitBounds(trip.bounds);

         var $summary = $('#summary');
         var $gpxLink = $('#gpx-download');
         // give map tiles an extra moment to load
         window.setTimeout(function() { $('#map-wait').remove(); }, 700);

         if (trip.miles > 0) {
            // implies a track exists
            $summary.show();
            if (allowDownload) { $gpxLink.show(); }
            $('#distance').html(trip.miles.toFixed(1));
            $('#duration').html(hoursAndMinutes(trip.hours));

            if (trip.topSpeed > 0) {
               $('#top-speed').html(trip.topSpeed.toFixed(1));
            } else {
               $('#top-speed,#top-speed-label').hide();
            }

            if (trip.avgSpeed > 0) {
               $('#avg-speed').html(trip.avgSpeed.toFixed(1));
            } else {
               $('#avg-speed,#avg-speed-label').hide();
            }

         } else {
            $summary.hide();
         }

         if (selected) { showPhoto(selected, preview); }
      }, 200);
   });

   /**
    * @see https://developers.google.com/maps/documentation/javascript/examples/layer-data-dragndrop
    */
   trip.map.data.addListener('click', function(event) { showPhoto(event.feature, preview); });
   trip.map.data.addListener('mouseover', function(event) {
      trip.map.data.overrideStyle(event.feature, { icon: '/img/camera-marker.png' });
   });
   trip.map.data.addListener('mouseout', function() { trip.map.data.revertStyle(); });
   trip.map.data.loadGeoJson('/' + postKey + '/geo.json');
});

/**
 * @param {google.maps.Data.Feature} feature
 * @param {google.maps.InfoWindow} modal
 */
function showPhoto(feature, modal) {
   if (modal && feature) {
      var image = feature.getProperty('url');
      var id = feature.getId();
      var geo = feature.getGeometry();
      var partKey = feature.getProperty('partKey');

      modal.setOptions({
         content: '<a href="/' + (partKey || postKey) + '#' + id + '"><img src="' + image + '"/></a>',
         position: geo.get()
      });
      modal.open(trip.map);
   }
}

function loadPostTrack(newKey) {
   trip.map.data.forEach(function(f) { trip.map.data.remove(f); });

   postKey = newKey;
   trip.miles = 0;
   trip.hours = 0;
   trip.topSpeed = 0;
   trip.avgSpeed = 0;
   trip.count = 0;
   trip.bounds = new google.maps.LatLngBounds();

   window.history.pushState(null, null, '/' + postKey + '/map');

   trip.map.data.loadGeoJson('/' + postKey + '/geo.json');
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
function encompass(bounds, geometry) {
   if (geometry instanceof google.maps.LatLng) {
      bounds.extend(geometry);
   } else if (geometry instanceof google.maps.Data.Point) {
      bounds.extend(geometry.get());
   } else {
      geometry.getArray().forEach(function(g) { encompass(bounds, g); });
   }
}