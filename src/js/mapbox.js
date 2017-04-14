'use strict';

var nav = new mapboxgl.NavigationControl();

var map = new mapboxgl.Map({
    container: 'map-canvas',
    //style: 'mapbox://styles/mapbox/satellite-streets-v9',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-116.0987, 44.9110],
    zoom: 6.5
}); 

map.addControl(nav, 'top-right');

map.on('load', function() {
   var showSatellite = false;
   var style = {
      street: 'streets-v9',
      satellite: 'satellite-streets-v9'
   };
   var $button = $('#toggle-satellite');

   // https://bl.ocks.org/tristen/0c0ed34e210a04e89984
   $button.click(function() {
      showSatellite = !showSatellite; 
      map.once('data', function(e) {
         if (e.dataType == 'style') { addMapLayers(); }
      });
      map.setStyle('mapbox://styles/mapbox/' + (showSatellite ? style.satellite : style.street));
      addMapLayers();
   });

   map.addSource('photos', {
      type: 'geojson',
      data: 'http://localhost:3000/geo.json',
      cluster: true,
      clusterMaxZoom: 15,
      clusterRadius: 20
   });

   addMapLayers();
});

function addMapLayers() {
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
}