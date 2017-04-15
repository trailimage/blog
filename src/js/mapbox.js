'use strict';

$(function() {
   var imageryOn = false;
   var style = {
      street: 'streets-v9',
      imagery: 'satellite-streets-v9'
   };
   var $preview = $('#photo-preview');
   var $button = $('#toggle-satellite');
   // https://www.mapbox.com/mapbox-gl-js/api/#navigationcontrol
   var nav = new mapboxgl.NavigationControl();
   // https://www.mapbox.com/mapbox-gl-js/api/
   var map = new mapboxgl.Map({
      container: 'map-canvas',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-116.0987, 44.7],
      zoom: 6.5,
      dragRotate: false
   });
   var canvas = map.getCanvasContainer();
   var markerOpacity = 0.6;

   /**
    * Cache GeoJSON so it can be reassigned if map style changes
    * @type {GeoJSON.FeatureCollection}
    */
   var geoJSON = null;

   map.addControl(nav, 'top-right')
      .on('load', function() {
         // https://bl.ocks.org/tristen/0c0ed34e210a04e89984
         $button.click(function() {
            imageryOn = !imageryOn;
            map.once('data', function(e) { if (e.dataType == 'style') { addMapLayers(); } })
               .setStyle('mapbox://styles/mapbox/' + (imageryOn ? style.imagery : style.street));
         });

         $.getJSON('/geo.json', function(data) {
            geoJSON = data;
            addMapLayers();
         });
      });


   function showImagery(enabled) {
      if (imageryOn == enabled) { return; }

      map.once('data', function(e) { if (e.dataType == 'style') { addMapLayers(); } })
         .setStyle('mapbox://styles/mapbox/' + (enabled ? style.imagery : style.street));
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

   /**
    * @param {mapboxgl.PointLike} point
    * @returns {mapboxgl.PointLike[]} bounding box
    * @see https://www.mapbox.com/mapbox-gl-js/api/#map#queryrenderedfeatures
    */
   function boxAroundPoint(point) {
      var offset = 100;
      return [
         [point.x - offset, point.y - offset],
         [point.x + offset, point.y + offset]
      ];
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
         .on('click', function() { $preview.hide(); });
         //.on('zoomend', function() { showImagery(map.getZoom() > 12); });

      // map.setFilter()

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