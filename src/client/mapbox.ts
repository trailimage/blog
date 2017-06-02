/// <reference types="jquery" />
/// <reference types="geojson" />
/// <reference types="mapbox-gl" />
/// <reference path="../types/mapbox-gl/index.d.ts" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/** Mapbox style identifier defined in /views/mapbox.hbs */
declare const mapStyle:string;
/** Post key if displaying map for post otherwise undefined */
declare const post:MapPost;
/** Whether GPX downloads are allowed */
declare const allowDownload:boolean;

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

   const style = {
      font: ['Open Sans Bold', 'Arial Unicode MS Bold'],
      minZoom: 6,
      maxZoom: 18
   };
   const eventCategory = 'Map';
   const $count = $('#photo-count');
   const $preview = $('#photo-preview');
   const $zoomOut = $('nav .zoom-out');
   const $legendToggle = $('#legend .toggle');
   const slug = post ? '/' + post.key : '';
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
      // https://github.com/mapbox/mapbox-gl-js/issues/3371
      //touchZoomRotate: false,
      keyboard: false
   });
   const canvas = map.getCanvasContainer();
   const markerOpacity = 0.6;
   const mapSize = { width: 0, height: 0 };
   const previewSize = { width: 322, height: 350 };
   /**
    * Whether styling for mobile device. Should match CSS media queries in
    * `settings.less` and `breakAt` in `responsive.ts`.
    */
   const mobileLayout = (width:number = 1024)=> window.innerWidth <= width;

   /**
    * Whether zoom-out button is enabled
    */
   let zoomOutEnabled = false;
   /**
    * CSS media query hides legend for mobile. Browser setting will also be
    * checkbed below to see if user hid legend.
    */
   let legendVisible = !mobileLayout();
   let photosVisible = true;
   /**
    * Analytics: only track first use of photo navigation.
    */
   let navigatedPhoto = false;
   /**
    * Don't update URL with map position until after automatic movements.
    */
   let showPositionInUrl = false;

   /**
    * Cache GeoJSON photos so it can be reassigned if map style changes
    */
   let geoJSON:GeoJSON.FeatureCollection<GeoJSON.Point> = null;

   /**
    * Methods for generating map content
    */
   const html = {
      /**
       * Format coordinates.
       */
      coordinate: function(pos:number[]):string {
         const factor = Math.pow(10, COORD_DECIMALS);
         const round = function(n:number):number { return Math.round(n * factor) / factor; };
         return round(pos[1]) + ', ' + round(pos[0]);
      },

      /**
       * Make photo HTML.
       */
      photo: function(f:GeoJSON.Feature<GeoJSON.Point>):JQuery {
         const img:MapPhoto = f.properties;
         const tip = 'Click or tap to enlarge';
         return $('<figure>')
            .append($('<img>')
               .attr('src', img.url)
               .attr('title', tip)
               .attr('alt', tip)
               .click(()=> { showPhotoInPost(img.url); })
            )
            .append($('<figcaption>')
               .html(this.coordinate(f.geometry.coordinates))
            );
      },

      /**
       * Show photo preview.
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
            .append(util.html.icon('close', handle.closePreview))
            .show({ complete: handle.previewShown });
      }
   };

   /**
    * Event handlers
    */
   const handle = {
      zoomEnd() {
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
      mapInteraction(e?:mapboxgl.EventData|FakeEvent) {
         if (e !== undefined && e.reason != 'fit') { handle.closePreview(); }
      },

      /**
       * Update map size variables when window is resized.
       */
      windowResize() {
         const $c = $('canvas');
         mapSize.width = $c.width();
         mapSize.height = $c.height();
      },

      /**
       * Copy current URL to clipboard.
       *
       * https://css-tricks.com/native-browser-copy-clipboard/
       */
      copyUrl(this:Element, e:JQueryMouseEventObject) {
         const $temp = $('<textarea>')
            .text(window.location.href)
            .appendTo(document.body)
            .hide();
         const range = document.createRange();
         try {
            range.selectNode($temp[0]);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            util.log.event(eventCategory, 'Copy URL');
         } catch (ex) {
            console.error(ex);
         }
         $temp.remove();
      },

      /**
       * Click on button with `data-link` attribute.
       */
      buttonClick(this:Element, e:JQueryMouseEventObject) {
         window.location.href = $(this).data('link');
      },

      /**
       * Click on button with `data-link` attribute having `lat`, `lon`
       * and `zoom` tokens.
       */
      mapLink(this:Element, e:JQueryMouseEventObject) {
         const lngLat = map.getCenter();
         const zoom = map.getZoom();
         // very rough conversion based on trial-and-error
         const altitude = (1/(Math.pow(2.3, zoom))) * 375000000;

         window.location.href = $(this).data('link')
            .replace('{lat}', lngLat.lat)
            .replace('{lon}', lngLat.lng)
            .replace('{zoom}', zoom)
            .replace('{altitude}', altitude);
      },

      /**
       * Respond to mouse click on photo marker.
       */
      photoClick(e:mapboxgl.MapMouseEvent) {
         html.photoPreview(e, 'single', html.photo(e.features[0]));
         util.log.event(eventCategory, 'Click Photo Pin');
      },

      /**
       * Attach events to the map to hide preview as soon as there's user
       * interaction.
       */
      previewShown() {
         map.on('move', handle.mapInteraction);
      },

      /**
       * Click to close photo preview.
       */
      closePreview() {
         $preview.hide();
         enableKeyNav(false);
         map.off('move', handle.mapInteraction);
      },

      /**
       * Click to show or hide photo layer.
       *
       * https://www.mapbox.com/mapbox-gl-js/example/toggle-layers/
       * https://www.mapbox.com/mapbox-gl-js/api/#map#setlayoutproperty
       */
      photoLayerToggle(this:Element, e:JQueryMouseEventObject) {
         photosVisible = !photosVisible;
         const p = photosVisible ? 'visible' : 'none';

         ['cluster', 'cluster-count', 'photo'].forEach(l => {
            map.setLayoutProperty(l, 'visibility', p);
         });

         $(this).find('p').html((photosVisible ? 'Hide' : 'Show') + ' Photos');
         util.log.event(eventCategory, (photosVisible ? 'Show' : 'Hide') + ' Photos');
      },

      legendToggle() {
         $legendToggle.parents('ul').toggleClass('collapsed');
         $('nav .toggle-legend').toggleClass('active');
         legendVisible = !legendVisible;
         if (!mobileLayout()) {
            util.setting.showMapLegend = legendVisible;
         }
         util.log.event(eventCategory, 'Toggle Legend');
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
       * https://github.com/mapbox/mapbox-gl-js/issues/2384
       */
      clusterClick: function(e:mapboxgl.MapMouseEvent) {
         const cluster:PointCluster = e.features[0].properties;
         const atZoom = map.getZoom();
         const zoomIn = ()=> {
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

                  if (!navigatedPhoto) {
                     // only track first use so logs aren't spammed
                     util.log.event(eventCategory, 'Navigate Photo Cluster');
                     navigatedPhoto = true;
                  }
               };
               const prev = ()=> { select(-1); };
               const next = ()=> { select(1); };

               if (!mobileLayout()) { enableKeyNav(true, next, prev); }

               for (let i = 0; i < photos.length; i++) {
                  $photos.append(html.photo(photos[i]));
               }

               if (photos.length > MAX_IN_CAROUSEL) {
                  $markers.addClass('too-many');
                  // use the same <i> tag that icons use to simplify CSS
                  for (let i = 0; i < photos.length; i++) {
                     $markers.append($('<i>').html((i + 1).toString()));
                  }
                  $markers.append('of ' + photos.length);
               } else {
                  for (let i = 0; i < photos.length; i++) {
                     $markers.append(util.html.icon('place'));
                  }
               }
               $('i:first-child', $markers).addClass('selected');

               html.photoPreview(e, 'list', $photos, $('<nav>')
                  .append(util.html.icon('arrow_back', prev))
                  .append($markers)
                  .append($('<div>').addClass('mobile-tip').html('tap photo to view post'))
                  .append(util.html.icon('arrow_forward', next)));

            }
         }
         util.log.event(eventCategory, 'Click Cluster');
      }
   };

   if (qs.center) { enableZoomOut(); }

   $legendToggle.click(handle.legendToggle);
   // legend nav button only visible on mobile
   $('nav button.toggle-legend').click(handle.legendToggle);
   $('nav button.map-link').click(handle.mapLink);
   $('nav button.copy-url').click(handle.copyUrl);
   $('nav button.toggle-photos').click(handle.photoLayerToggle);

   window.addEventListener('resize', handle.windowResize);

   if (legendVisible) {
      // if set visible but user hid it then toggle off
      if (!util.setting.showMapLegend) { $legendToggle.click(); }
   } else {
      // ensure that legend has 'collapsed' class to match its visibility
      $legendToggle.parents('ul').addClass('collapsed');
   }

   map.addControl(nav, 'top-right')
      .on('load', ()=> {
         $.getJSON('/geo.json', data => {
            geoJSON = data;
            $count.find('div').html(geoJSON.features.length.toString());
            addBaseLayers();
            addMapHandlers();
            addMoscowMountainLayers();
            // set initial map dimensions
            handle.windowResize();
         });

         if (post) {
            // Expand bounds so pictures aren't right at the edge. This should
            // probably do something smarter like a percent of bounding box.
            post.bounds.sw[0] -= 0.01;
            post.bounds.sw[1] -= 0.01;
            post.bounds.ne[0] += 0.01;
            post.bounds.ne[1] += 0.01;
            $.getJSON('/' + post.key + '/geo.json', addPostLayers);
         } else {
            showPositionInUrl = true;
         }
      });

   /**
    * Preview images may be 320 pixels on a side.
    */
   function getPreviewPosition(e:mapboxgl.MapMouseEvent):CssPosition {
      let x = e.point.x;
      let y = e.point.y;

      if (mobileLayout(767)) {
         return {
            top: (mapSize.height - previewSize.height) / 2,
            right: 0
         };
      } else {
         const offset = {
            x: (x + previewSize.width) - mapSize.width,
            y: (y + previewSize.height) - mapSize.height
         };
         offset.x = offset.x < 0 ? 0 : offset.x + 10;
         offset.y = offset.y < 0 ? 0 : offset.y + 10;

         x -= offset.x;
         y -= offset.y;

         if (offset.x + offset.y > 0) {
            map.panBy([offset.x, offset.y], { duration: 100 }, {
               type: null,
               point: null,
               target: null,
               reason: 'fit',
               lngLat: null,
               originalEvent: null
            });
         }
         return { top: y + 15, left: x + 50 };
      }
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
               case 27: handle.mapInteraction(); break;
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
    * Get number of photos nearest to a location. This is a hack while Mapbox
    * clusters are unable to report which photos they contain.
    */
   function photosNearLocation(lngLat:mapboxgl.LngLat, count:number):GeoJSON.Feature<GeoJSON.Point>[] {
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
            (f.properties as MapPhoto).distance = distance(lngLat, f.geometry.coordinates);
            return f;
         });

      photos.sort((p1, p2) => (p1.properties as MapPhoto).distance - (p2.properties as MapPhoto).distance);

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
      if (showPositionInUrl) {
         const lngLat = map.getCenter();
         const url = slug + '/map?lat=' + lngLat.lat + '&lon=' + lngLat.lng + '&zoom=' + map.getZoom();
         window.history.replaceState(null, null, url);
      }
   }

   /**
    * Enable or disable the zoom-out button.
    */
   function enableZoomOut() {
      if (map.getZoom() > initial.zoom && !zoomOutEnabled) {
         zoomOutEnabled = true;
         $zoomOut
            .click(() => {
               map.easeTo(initial);
               util.log.event(eventCategory, 'Zoom Out');
            })
            .removeClass('disabled');
      } else if (map.getZoom() <= initial.zoom && zoomOutEnabled) {
         zoomOutEnabled = false;
         $zoomOut.off('click').addClass('disabled');
      }
   }

   /**
    * Curry function to update canvas cursor.
    */
   const cursor = (name:string = '') => ()=> { canvas.style.cursor = name; };

   /**
    * Retrieve photo ID from preview URL and redirect to post with that photo.
    *
    * Example https://farm3.staticflickr.com/2853/33767184811_9eff6deb48_n.jpg
    */
   function showPhotoInPost(url:string) {
      const path = url.split('/');
      const parts = path[path.length - 1].split('_');
      window.location.href = '/' + parts[0];
   }

   /**
    * Assign source and create layer for post track.
    *
    * https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-line
    */
   function addPostLayers(track:GeoJSON.FeatureCollection<GeoJSON.LineString>) {
      if (track.features.length > 0) {
         map.addSource('track', { type: 'geojson', data: track })
            .addLayer({
               id: 'track',
               type: 'line',
               source: 'track',
               layout: {
                  'line-join': 'round',
                  'line-cap': 'butt'
               },
               paint: {
                  'line-color': '#f22',
                  'line-width': 5,
                  'line-opacity': 0.7,
                  'line-dasharray': [1, 0.8]
               }
            }, 'photo');

         $('#legend .track').removeClass('hidden');
      }

      $('nav > button.link').click(handle.buttonClick);

      // avoid updating URL with automatic reposition
      map.once('zoomend', ()=> {
         window.setTimeout(() => { showPositionInUrl = true; }, 500);
      });

      // https://www.mapbox.com/mapbox-gl-js/api/#map#fitbounds
      map.fitBounds([post.bounds.sw, post.bounds.ne]);
   }

   /**
    * https://www.mapbox.com/mapbox-gl-js/example/vector-source/
    */
   function addMoscowMountainLayers() {
      map.addSource('moscow-mountain', {
         type: 'vector',
         url: 'mapbox://jabbott7.1q8zrllv',
         tileSize: 512
      });

      map.addLayer({
         id: 'mountain-labels',
         type: 'symbol',
         source: 'moscow-mountain',
         'source-layer': 'moscow-mountain-dvde24',
         layout: {
            'text-font': style.font,
            'text-field': '{name}',
            'text-size': {
               base: 1,
               stops: [[10, 10], [14, 13]]
            },
            'symbol-placement': {
               base: 1,
               stops: [[10, 'point'], [14, 'line']]
            },
            'text-rotation-alignment': 'map',
            'symbol-spacing': 50
         },
         paint: {
            'text-color': '#fff',
            'text-halo-color': '#000',
            'text-halo-width': 1,
            'text-halo-blur': 1
         },
         minzoom: 6,
         maxzoom: 18
      });

      map.addLayer({
         id: 'mountain-tracks',
         type: 'line',
         source: 'moscow-mountain',
         'source-layer': 'moscow-mountain-dvde24',
         paint: {
            'line-color': '#55f',
            'line-width': {
               base: 1,
               stops: [[8, 1], [13, 2]]
            }
         },
         minzoom: style.minZoom,
         maxzoom: style.maxZoom
      }, 'mountain-labels');

   }

   /**
    * Assign source and define layers for clustering.
    */
   function addBaseLayers() {
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
            'text-font': style.font,
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
   }

   /**
    * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/354cec620daccfa0ad167ba046651fb5fef69e8a/types/mapbox-gl/index.d.ts
    */
   function addMapHandlers() {
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