'use strict';

$(function() {
   var showSatellite = false;
   var style = {
      street: 'streets-v9',
      satellite: 'satellite-streets-v9'
   };
   var $button = $('#toggle-satellite');
   var nav = new mapboxgl.NavigationControl();
   var map = new mapboxgl.Map({
      container: 'map-canvas',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-116.0987, 44.7],
      zoom: 6.5
   });

   /**
    * Cache GeoJSON so it can be reassigned if map style changes
    * @type {GeoJSON.FeatureCollection}
    */
   var geoJSON = null;

   map.addControl(nav, 'top-right');
   map.on('load', function() {
      // https://bl.ocks.org/tristen/0c0ed34e210a04e89984
      $button.click(function() {
         showSatellite = !showSatellite;
         map.once('data', function(e) {
            if (e.dataType == 'style') { addMapLayers(); }
         });
         map.setStyle('mapbox://styles/mapbox/' + (showSatellite ? style.satellite : style.street));
         addMapLayers();
      });

      $.getJSON('/geo.json', function(data) {
         geoJSON = data;
         addMapLayers();
      });
   });

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
         id: 'clusters',
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
            'circle-opacity': 0.6,
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
         id: 'unclustered-point',
         type: 'circle',
         source: 'photos',
         filter: ['!has', 'point_count'],
         paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
         }
      });

      // https://bl.ocks.org/tristen/863dfc36e3e7b38059f0bc20ef54e9fa
      map.addSource('cluster-hover', {
         type: 'geojson',
         data: {
            type: 'FeatureCollection',
            features: []
         }
      });

      map.addLayer({
         id: 'cluster-hover',
         source: 'cluster-hover',
         type: 'circle',
         paint: {
            'circle-color': '#F86767',
            'circle-stroke-width': 4,
            'circle-stroke-color': '#fff',
            'circle-radius': 20
         }
      });

      map.on('mousemove', function(e) {
         var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
         map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

         var geojson = {
            type: 'FeatureCollection',
            features: []
         };

         if (!features.length) {
            map.getSource('cluster-hover').setData(geojson);
            return;
         }

         geojson.features.push(features[0]);
         map.getSource('cluster-hover').setData(geojson);
      });
   }
});