"use strict";$(function(){function o(o){o==i||!o&&r||(i=o,i?(f.on.show(),f.off.hide()):(f.on.hide(),f.off.show()),h.once("data",function(o){"style"==o.dataType&&c()}),h.setStyle("mapbox://styles/mapbox/"+(i?l.imagery:l.street)))}function t(){h.getZoom()>s.zoom&&!v?(v=!0,d.click(function(){h.easeTo(s)}).removeClass("disabled")):h.getZoom()<=s.zoom&&v&&(v=!1,d.off("click").addClass("disabled"))}function e(o){return void 0===o&&(o=""),function(){g.style.cursor=o}}function n(o){var t=o.split("/"),e=t[t.length-1].split("_");window.location="/"+e[0]}function c(){h.addSource("photos",{type:"geojson",data:w,cluster:!0,clusterMaxZoom:15,clusterRadius:20}),h.addLayer({id:"cluster",type:"circle",source:"photos",filter:["has","point_count"],paint:{"circle-color":"#524948","circle-radius":{property:"point_count",type:"interval",stops:[[0,13],[50,17],[100,20]]},"circle-opacity":y,"circle-stroke-width":3,"circle-stroke-color":"#ccc"}}),h.addLayer({id:"cluster-count",type:"symbol",source:"photos",filter:["has","point_count"],layout:{"text-field":"{point_count_abbreviated}","text-font":["Open Sans Bold","Arial Unicode MS Bold"],"text-size":14},paint:{"text-color":"#fff"}}),h.addLayer({id:"photo",type:"circle",source:"photos",filter:["!has","point_count"],paint:{"circle-color":"#f00","circle-radius":7,"circle-stroke-width":4,"circle-stroke-color":"#fdd","circle-opacity":y}}),h.on("mouseenter","cluster",e("pointer")).on("mouseleave","cluster",e()).on("mouseenter","photo",e("pointer")).on("mouseleave","photo",e()).on("move",function(){p.hide()}).on("click",function(){p.hide()}).on("zoomend",function(){t(),o(h.getZoom()>12)}),h.on("mousedown","cluster",function(o){o.features[0].properties.point_count>5?h.easeTo({center:o.lngLat,zoom:h.getZoom()+2}):(new mapboxgl.LngLatBounds(o.lngLat,o.lngLat),console.log(h.getSource("photos")))}),h.on("mousedown","photo",function(o){var t=o.features[0].properties;p.empty().append($("<img>").attr("src",t.url)).append($("<div>").html(o.lngLat.lat+", "+o.lngLat.lng)).css({top:o.point.y,left:o.point.x}).click(function(){n(t.url)}).show()})}var i=!1,r=!1,s={zoom:6.5,center:[-116.0987,44.7]},l={street:"streets-v9",imagery:"satellite-streets-v9"},a=$("#photo-count"),p=$("#photo-preview"),u=$("#toggle-satellite"),d=$("#zoom-out"),f={on:$("nav .glyphicon-check"),off:$("nav .glyphicon-unchecked")},m=new mapboxgl.NavigationControl,h=new mapboxgl.Map({container:"map-canvas",style:"mapbox://styles/mapbox/streets-v9",center:s.center,zoom:s.zoom,dragRotate:!1}),g=h.getCanvasContainer(),y=.6,v=!1,w=null;h.addControl(m,"top-right").on("load",function(){u.click(function(){r=!r,o(r)}),$.getJSON("/geo.json",function(o){w=o,a.html(w.features.length+" photos").show(),c()})})});
//# sourceMappingURL=/js/maps/mapbox.js.map
