'use strict';

var nav = new mapboxgl.NavigationControl();

var map = new mapboxgl.Map({
    container: 'map-canvas',
    style: 'mapbox://styles/mapbox/satellite-streets-v9',
    center: [-116.215019, 43.618881],
    zoom: 8
});

map.addControl(nav, 'top-left');

map.on('load', function() {
   map.addSource('photos', {
      type: 'geojson',
      data: 'http://localhost:3000/geo.json',
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
         'circle-color': {
            property: 'point_count',
            type: 'interval',
            stops: [
               [0, "#51bbd6"],
               [100, "#f1f075"],
               [750, "#747e73"],
            ]
         },
         'circle-radius': {
            property: 'point_count',
            type: 'interval',
            stops: [
               [0, 20],
               [100, 30],
               [750, 40]
            ]
         },
         'circle-stroke-width': 3,
         'circle-stroke-color': '#524948' 
      }
   });

   map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'photos',
      filter: ['has', 'point_count'],
      layout: {
         'text-field': '{point_count_abbreviated}',
         'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
         'text-size': 12
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
})