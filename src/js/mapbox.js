'use strict';

$(function() {
   /**
    * Whether imagery is on either by user click or zoom
    */
   var imageryOn = false;
   /**
    * Whether user clicked button to enable imagery
    */
   var userImageryOn = false;
   var initial = { zoom: 6.5, center: [-116.0987, 44.7] };
   var style = {
      street: 'streets-v9',
      imagery: 'satellite-streets-v9'
   };
   var $count = $('#photo-count');
   var $preview = $('#photo-preview');
   var $showImagery = $('#toggle-satellite');
   var $zoomOut = $('#zoom-out');
   var $check = {
      on: $('nav .glyphicon-check'),
      off: $('nav .glyphicon-unchecked')
   };
   // https://www.mapbox.com/mapbox-gl-js/api/#navigationcontrol
   var nav = new mapboxgl.NavigationControl();
   // https://www.mapbox.com/mapbox-gl-js/api/
   var map = new mapboxgl.Map({
      container: 'map-canvas',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: initial.center,
      zoom: initial.zoom,
      dragRotate: false
   });
   var canvas = map.getCanvasContainer();
   var markerOpacity = 0.6;
   var zoomOutEnabled = false;

   /**
    * Cache GeoJSON so it can be reassigned if map style changes
    * @type {GeoJSON.FeatureCollection}
    */
   var geoJSON = null;

   map.addControl(nav, 'top-right')
      .on('load', function() {
         $showImagery.click(function() {
            userImageryOn = !userImageryOn;
            showImagery(userImageryOn);
         });

         $.getJSON('/geo.json', function(data) {
            geoJSON = data;
            $count.html(geoJSON.features.length + ' photos').show();
            addMapLayers();
         });
      });

   /**
    * Enable or disable satellite imagery. Abort if the setting is unchanged
    * or if trying to disable user set imagery.
    * @param {boolean} enabled
    */
   function showImagery(enabled) {
      if (enabled == imageryOn || (!enabled && userImageryOn)) { return; }

      imageryOn = enabled;

      if (imageryOn) {
         $check.on.show(); $check.off.hide();
      } else {
         $check.on.hide(); $check.off.show();
      }
      map.once('data', function(e) { if (e.dataType == 'style') { addMapLayers(); } });
      map.setStyle('mapbox://styles/mapbox/' + (imageryOn ? style.imagery : style.street));
   }

   /**
    * Enable or disable the zoom-out button.
    */
   function enableZoomOut() {
      if (map.getZoom() > initial.zoom && !zoomOutEnabled) {
         zoomOutEnabled = true;
         $zoomOut
            .click(function() { map.easeTo(initial); })
            .removeClass('disabled');
      } else if (map.getZoom() <= initial.zoom && zoomOutEnabled) {
         zoomOutEnabled = false;
         $zoomOut.off('click').addClass('disabled');
      }
   }

   /**
    * Curry function to update cursor
    * @param {string} name
    * @returns {function}
    */
   function cursor(name) {
      if (name === undefined) { name = ''; }
      return function() { canvas.style.cursor = name; };
   }

   /**
    * Retrieve photo ID from preview URL and redirect to post with that photo
    * @param {string} url
    * @example https://farm3.staticflickr.com/2853/33767184811_9eff6deb48_n.jpg
    */
   function showPhotoInPost(url) {
      var path = url.split('/');
      var parts = path[path.length - 1].split('_');
      window.location = '/' + parts[0];
   }

   function boxAroundLatLon(latLon) {
      var offset = 100;

   }

   function addMapLayers() {
      map.addSource('photos', {
         type: 'geojson',
         data: geoJSON,
         cluster: true,
         clusterMaxZoom: 15,
         clusterRadius: 20
      });

      // https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-circle
      // https://www.mapbox.com/mapbox-gl-js/style-spec/#types-function
      map.addLayer({
         id: 'cluster',
         type: 'circle',
         source: 'photos',
         filter: ['has', 'point_count'],
         paint: {
            'circle-color': '#524948',
            'circle-radius': {
               property: 'point_count',
               type: 'interval',
               stops: [
                  [0, 13],
                  [50, 17],
                  [100, 20]
               ]
            },
            'circle-opacity': markerOpacity,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ccc'
         }
      });

      // https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-symbol
      map.addLayer({
         id: 'cluster-count',
         type: 'symbol',
         source: 'photos',
         filter: ['has', 'point_count'],
         layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14
         },
         paint: {
            'text-color': '#fff'
         }
      });

      // https://www.mapbox.com/mapbox-gl-js/example/custom-marker-icons/
      map.addLayer({
         id: 'photo',
         type: 'circle',
         source: 'photos',
         filter: ['!has', 'point_count'],
         paint: {
            'circle-color': '#f00',
            'circle-radius': 7,
            'circle-stroke-width': 4,
            'circle-stroke-color': '#fdd',
            'circle-opacity': markerOpacity
         }
      });

      map.on('mouseenter', 'cluster', cursor('pointer'))
         .on('mouseleave', 'cluster', cursor())
         .on('mouseenter', 'photo', cursor('pointer'))
         .on('mouseleave', 'photo', cursor())
         .on('move', function()  { $preview.hide(); })
         .on('click', function() { $preview.hide(); })
         .on('zoomend', function() {
            enableZoomOut();
            showImagery(map.getZoom() > 12);
         });

      // map.setFilter()

      // https://github.com/mapbox/mapbox-gl-js/issues/2384
      map.on('mousedown', 'cluster', function(e) {
         var cluster = e.features[0].properties;
         //console.log('cluster', e);

         if (cluster.point_count > 5) {
            map.easeTo({
               center: e.lngLat,
               zoom: map.getZoom() + 2
            });
         } else {
            var bounds = new mapboxgl.LngLatBounds(
               e.lngLat,
               e.lngLat
            );

            console.log(map.getSource('photos'));

            //console.log(bounds);

            // map.unitsLayer.eachLayer(function(marker) {
            //    if(bounds.contains(marker.getLatLng())) {
            //       map.select(marker);
            //    }
            // });


            // var features = map.querySourceFeatures('photo', {
            //    filter: [
            //       'all',
            //       ['<=', '', e.lngLat.lon],
            //       ['<=', '', e.lngLat.lng]
            //    ]
            // });
            //console.log('Found', features);

         }
      });

      map.on('mousedown', 'photo', function(e) {
         var img = e.features[0].properties;

         $preview
            .empty()
            .append($('<img>').attr('src', img.url))
            .append($('<div>').html(e.lngLat.lat + ', ' + e.lngLat.lng))
            .css({ top: e.point.y, left: e.point.x })
            .click(function() { showPhotoInPost(img.url); })
            .show();
      });
   }
});