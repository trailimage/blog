/// <reference types="jquery" />
/// <reference types="geojson" />
/// <reference types="mapbox-gl" />

import { MapPhoto } from '../types/';

/**
 * Mapbox style identifier defined in /views/mapbox.hbs
 */
declare const mapStyle:string;

declare interface UrlPosition {
   [key:string]:number|number[];
   /** longitude, latitude */
   center?:number[];
   lon?:number;
   lat?:number;
   zoom?:number;
}

$(function() {
   const MAX_ZOOM = 18;
   /**
    * Number of decimals to round coordinates to.
    */
   const COORD_DECIMALS = 5;
   /**
    * Maximum number of photos to display in carousel.
    */
   const MAX_IN_CAROUSEL = 20;
   /**
    * Initial map position if not specified in URL
    */
   const initial:UrlPosition = { zoom: 6.5, center: [-116.0987, 44.7] };

   const $count = $('#photo-count');
   const $preview = $('#photo-preview');
   const $zoomOut = $('#zoom-out');
   const qs = parseUrl();

   /** https://www.mapbox.com/mapbox-gl-js/api/#navigationcontrol */
   const nav = new mapboxgl.NavigationControl();

   /** https://www.mapbox.com/mapbox-gl-js/api/ */
   const map = new mapboxgl.Map({
      container: 'map-canvas',
      style: 'mapbox://styles/' + mapStyle,
      center: qs.center || initial.center,
      zoom: qs.zoom || initial.zoom,
      maxZoom: MAX_ZOOM,
      dragRotate: false,
      keyboard: false
   });
   const canvas = map.getCanvasContainer();
   const markerOpacity = 0.6;
   const mapSize = { width: 0, height: 0 };
   const previewSize = { width: 322, height: 350 };

   /**
    * Whether zoom-out button is enabled
    */
   let zoomOutEnabled = false;

   /**
    * Cache GeoJSON so it can be reassigned if map style changes
    */
   let geoJSON:GeoJSON.FeatureCollection<any> = null;

   /**
    * Methods for generating map content
    */
   const html = {
      /**
       * Generate Google material icon HTML
       *
       * See https://material.io/icons/
       */
      icon: function(name:string, handler?:Function):JQuery {
         const $icon = $('<i>')
            .addClass('material-icons ' + name)
            .text(name);

         if (handler !== undefined) { $icon.click(handler); }
         return $icon;
      },

      /**
       * Format coordinates
       */
      coordinate: function(pos:number[]):string {
         const factor = Math.pow(10, COORD_DECIMALS);
         const round = function(n:number):number { return Math.round(n * factor) / factor; };
         return round(pos[1]) + ', ' + round(pos[0]);
      },

      /**
       * Make photo HTML
       */
      photo: function(f:GeoJSON.Feature<GeoJSON.Point>):JQuery {
         const img:MapPhoto = f.properties;
         const tip = 'Click or tap to enlarge';
         return $('<figure>')
            .append($('<img>')
               .attr('src', img.url)
               .attr('title', tip)
               .attr('alt', tip)
               .click(function() { showPhotoInPost(img.url); })
            )
            .append($('<figcaption>')
               .html(this.coordinate(f.geometry.coordinates))
            );
      },

      /**
       * Show photo preview
       */
      photoPreview: function(e:mapboxgl.MapMouseEvent, cssClass:string, content:JQuery, navigation?:JQuery) {
         $preview
            .empty()
            .removeClass()
            .css(getPreviewPosition(e));

         if (navigation !== undefined) { $preview.append(navigation); }

         $preview
            .addClass(cssClass)
            .append(content)
            .append(html.icon('close', handle.closePreview))
            .show({ complete: handle.previewShown });
      }
   };

   /**
    * Event handlers
    */
   const handle = {
      zoomEnd: function() {
         updateUrl();
         enableZoomOut();
      },

      /**
       * Handle keyboard events while photo preview is visible.
       */
      keyNav: null as EventListener,

      /**
       * Respond to user map interaction by hiding photo preview.
       */
      mapInteraction: function(e:mapboxgl.EventData|KeyboardEvent) {
         if (e.reason != 'fit') { handle.closePreview(); }
      },

      /**
       * Update map size variables when window is resized.
       */
      windowResize: function() {
         const $c = $('canvas');
         mapSize.width = $c.width();
         mapSize.height = $c.height();
      },

      /**
       * Respond to mouse click on photo marker. When preview is shown, start
       * listening for map interaction events to hide the preview.
       */
      photoClick: function(e:mapboxgl.MapMouseEvent) {
         html.photoPreview(e, 'single', html.photo(e.features[0]));
      },

      /**
       * Attach events to the map to hide preview as soon as there's user
       * interaction.
       */
      previewShown: function() {
         map.on('move', handle.mapInteraction);
      },

      /**
       * Click to close photo preview
       */
      closePreview: function() {
         $preview.hide();
         enableKeyNav(false);
         map.off('move', handle.mapInteraction);
      },

      /**
       * Respond to mouse click on cluster marker by showing the nearest
       * photos equal to the cluster count.
       *
       * These may not be the same photos represented by the cluster since
       * the event coordinate is not the cluster center but the click position
       * and I've not been able to find a function that exactly relates zoom
       * level to the radius represented by the cluster.
       *
       * See https://github.com/mapbox/mapbox-gl-js/issues/2384
       */
      clusterClick: function(e:mapboxgl.MapMouseEvent) {
         const cluster:mapboxgl.PointCluster = e.features[0].properties;
         const atZoom = map.getZoom();
         const zoomIn = function() {
            map.easeTo({
               center: e.lngLat,
               zoom: MAX_ZOOM - atZoom < 2 ? MAX_ZOOM : atZoom + 2
            });
         };

         if (cluster.point_count > MAX_IN_CAROUSEL && atZoom < MAX_ZOOM - 2) {
            zoomIn();
         } else {
            const photos = photosNearLocation(e.lngLat, cluster.point_count);
            if (photos.length == 0) {
               zoomIn();
            } else {
               let selected = 1;
               const $photos = $('<div>').addClass('photo-list');
               const $markers = $('<div>').addClass('markers');
               const select = (count:number) => {
                  selected += count;
                  if (selected > photos.length) {
                     selected = 1;
                  } else if (selected < 1) {
                     selected = photos.length;
                  }
                  $('figure', $photos).hide();
                  $('i', $markers).removeClass('selected');
                  $('figure:nth-child(' + selected + ')', $photos).show();
                  $('i:nth-child(' + selected + ')', $markers).addClass('selected');
               };
               const prev = ()=> { select(-1); };
               const next = ()=> { select(1); };

               enableKeyNav(true, next, prev);

               for (let i = 0; i < photos.length; i++) {
                  $photos.append(html.photo(photos[i]));
                  $markers.append(html.icon('place'));
               }
               $('i:first-child', $markers).addClass('selected');

               html.photoPreview(e, 'list', $photos, $('<nav>')
                  .append(html.icon('arrow_back', prev))
                  .append($markers)
                  .append(html.icon('arrow_forward', next)));
            }
         }
      }
   };

   if (qs.center) { enableZoomOut(); }

   window.addEventListener('resize', handle.windowResize);

   map.addControl(nav, 'top-right')
      .on('load', function() {
         $.getJSON('/geo.json', function(data) {
            geoJSON = data;
            $count.html(geoJSON.features.length + ' photos').show();
            addMapLayers();
            // set initial map dimensions
            handle.windowResize();
         });
      });

   /**
    * Preview images may be 320 pixels on a side
    */
   function getPreviewPosition(e:mapboxgl.MapMouseEvent):object {
      let x = e.point.x;
      let y = e.point.y;
      const offset = {
         x: (x + previewSize.width) - mapSize.width,
         y: (y + previewSize.height) - mapSize.height
      };
      offset.x = offset.x < 0 ? 0 : offset.x + 10;
      offset.y = offset.y < 0 ? 0 : offset.y + 10;

      x -= offset.x;
      y -= offset.y;

      if (offset.x + offset.y > 0) {
         map.panBy([offset.x, offset.y], { duration: 100 }, { reason: 'fit' });
      }
      return { top: y + 15, left: x };
   }

   /**
    * Load map location from URL.
    */
   function parseUrl():UrlPosition {
      const parts = window.location.search.split(/[&\?]/g);
      const qs:UrlPosition = {};
      for (let i = 0; i < parts.length; i++) {
         const pair = parts[i].split('=');
         if (pair.length == 2) { qs[pair[0]] = parseFloat(pair[1]); }
      }
      if (qs.hasOwnProperty('lat') && qs.hasOwnProperty('lon')) {
         qs.center = [qs.lon, qs.lat];
      }
      return qs;
   }

   /**
    * Enable or disable keyboard photo navigation.
    */
   function enableKeyNav(enable:boolean, next?:Function, prev?:Function) {
      if (enable) {
         handle.keyNav = (e:KeyboardEvent) => {
            switch (e.keyCode) {
               case 27: handle.mapInteraction(e); break;
               case 37: prev(); break;
               case 39: next(); break;
            }
         };
         document.addEventListener('keydown', handle.keyNav);
      } else {
         document.removeEventListener('keydown', handle.keyNav);
      }
   }

   /**
    * Get number of photos nearest to a location.
    */
   function photosNearLocation(lngLat:mapboxgl.LngLat, count:number):GeoJSON.Feature<any>[] {
      const z = map.getZoom();
      const f = (z * 3) / Math.pow(2, z);
      const sw = [lngLat.lng - f, lngLat.lat - f];
      const ne = [lngLat.lng + f, lngLat.lat + f];
      const photos = geoJSON.features
         .filter(f => {
            const coord = f.geometry.coordinates;
            return coord[0] >= sw[0] && coord[1] >= sw[1]
                && coord[0] <= ne[0] && coord[1] <= ne[1];
         })
         .map(f => {
            f.properties.distance = distance(lngLat, f.geometry.coordinates);
            return f;
         });

      photos.sort((p1, p2) => p1.properties.distance - p2.properties.distance);

      return photos.slice(0, count);
   }

   /**
    * Straight-line distance between two points.
    */
   function distance(lngLat:mapboxgl.LngLat, point:number[]):number {
      const x1 = lngLat.lng;
      const y1 = lngLat.lat;
      const x2 = point[0];
      const y2 = point[1];
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
   }

   /**
    * Update URL with current zoom level and map center.
    */
   function updateUrl() {
      const lngLat = map.getCenter();
      const url = '/map?lat=' + lngLat.lat + '&lon=' + lngLat.lng + '&zoom=' + map.getZoom();
      window.history.replaceState(null, null, url);
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
    * Curry function to update canvas cursor.
    */
   function cursor(name?:string):Function {
      if (name === undefined) { name = ''; }
      return function() { canvas.style.cursor = name; };
   }

   /**
    * Retrieve photo ID from preview URL and redirect to post with that photo
    *
    * Example https://farm3.staticflickr.com/2853/33767184811_9eff6deb48_n.jpg
    */
   function showPhotoInPost(url:string) {
      const path = url.split('/');
      const parts = path[path.length - 1].split('_');
      window.location.href = '/' + parts[0];
   }

   /**
    * Assign source and define layers for clustering.
    */
   function addMapLayers() {
      map.addSource('photos', {
         type: 'geojson',
         data: geoJSON,
         cluster: true,
         clusterMaxZoom: 18,
         clusterRadius: 30
      });

      // https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-circle
      // https://www.mapbox.com/mapbox-gl-js/style-spec/#types-function
      map.addLayer({
         id: 'cluster',
         type: 'circle',
         source: 'photos',
         filter: ['has', 'point_count'],
         paint: {
            'circle-color': '#422',
            'circle-radius': {
               property: 'point_count',
               type: 'interval',
               stops: [
                  [0, 10],
                  [10, 12],
                  [100, 15]
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

      // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/354cec620daccfa0ad167ba046651fb5fef69e8a/types/mapbox-gl/index.d.ts
      map.on('mouseenter', 'cluster', cursor('pointer'))
         .on('mouseleave', 'cluster', cursor())
         .on('mouseenter', 'photo', cursor('pointer'))
         .on('mouseleave', 'photo', cursor())
         .on('zoomend', handle.zoomEnd)
         .on('moveend', updateUrl)
         .on('click', 'cluster', handle.clusterClick)
         .on('click', 'photo', handle.photoClick);
   }
});