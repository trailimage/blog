"use strict";$(function(){$(".static-map").each(function(t,a){var n=$(a),c=n.data("locations"),e=n.data("href");if(c&&e&&c.length>0){var i=c.map(function(t){return"url-"+encodeURIComponent("http://www.trailimage.com/p.png("+t[0]+","+t[1]+")")});n.attr("src",e.replace("-pins-",i.join(",")))}})});
//# sourceMappingURL=/js/maps/category.js.map
