"use strict";$(function(){var l="Post",t=$("figure"),s=$("#light-box");function c(){$("html").css("overflow","hidden"),document.ontouchmove=function(t){t.preventDefault()}}function e(){$("html").css("overflow","auto"),$(window).off("resize"),document.ontouchmove=null}s.on("click",function(){s.off("mousemove").hide(0,e)}),t.find("img").on("click",function(t){var e=$(this),o=s.find("img"),i=e.data("big-loaded"),n=new u(e.data("big-width"),e.data("big-height")),a={top:0,left:0},r=function(t){var e="zoom-out";n.update(),n.needsToPan?(e="move",s.on("mousemove",h),s.on("touchstart",f),s.on("touchmove",d)):(s.off("mousemove",h),s.off("touchstart",f),s.off("touchmove",d)),h(t),o.css("cursor",e)},h=function(t){o.css({top:n.height.CSS(t.clientY),left:n.width.CSS(t.clientX)})},f=function(t){var e=t.targetTouches[0],i=o.position();a.left=i.left-e.clientX,a.top=i.top-e.clientY},d=function(t){var e=t.targetTouches[0];o.css({top:a.top+e.clientY,left:a.left+e.clientX})};void 0===i&&(i=!1);i?o.attr("src",e.data("big")):(o.attr("src",e.data("original")),$("<img />").bind("load",function(){o.attr("src",this.src),e.data("big-loaded",!0)}).attr("src",e.data("big")));o.height(n.height.image).width(n.width.image),r(t),s.show(0,c),$(window).resize(r),util.log.event(l,"Show Lightbox")}).lazyload(),t.find(".mobile-button").on("touchstart",function(t){var e=$(this),i="mobile-info",o="info-visible",n="info-loaded",a="active",r=e.parent();t.preventDefault(),t.stopImmediatePropagation(),r.data(o)?(e.removeClass(a),r.data(o,!1).find("."+i).hide()):(e.addClass(a),r.data(o,!0),r.data(n)?r.find("."+i).show():($("<div/>").addClass(i).load(r.data("exif"),function(){$(this).appendTo(r),r.data(n,!0)}),util.log.event(l,"Show Photo Info","Mobile")))}),t.find(".info-button").one("mouseover",function(){var t,e,i=$(this);i.addClass("loading").html((t="cloud_download",e="Loading …",util.html.icon(t).get(0).outerHTML+"<p>"+e+"</p>")).load(i.parent().data("exif"),function(){i.removeClass("loading").addClass("loaded")}),util.log.event(l,"Show Photo Info")});var i=function(){function t(t){this.image=parseInt(t),this.window=0,this.extra=0,this.panRatio=0}return t.prototype.update=function(t){this.window=t,this.extra=(this.window-this.image)/2},t.prototype.ratio=function(){return(this.window-this.image)/this.window*2},t.prototype.CSS=function(t){var e=0<this.extra?0:(this.window/2-t)*this.panRatio;return(this.extra-e).toFixed(0)+"px"},t}(),u=function(){function t(t,e){this.width=new i(t),this.height=new i(e)}return t.prototype.update=function(){this.height.update(window.innerHeight),this.width.update(window.innerWidth),this.needsToPan=this.width.extra<0||this.height.extra<0,this.needsToPan&&(this.height.panRatio=this.width.panRatio=this.width.extra<this.height.extra&&this.width.extra<0?this.width.ratio():this.height.ratio())},t}()}),$(function(){$(".static-map").each(function(t,e){var i=$(e),o=i.data("locations"),n=i.data("href");if(o&&n&&0<o.length){var a=o.map(function(t){return"url-"+encodeURIComponent("https://www.trailimage.com/p.png("+t[0]+","+t[1]+")")});i.attr("src",n.replace("-pins-",a.join(",")))}})}),function(h,o,n,f){var d=h(o);h.fn.lazyload=function(t){var e,a=this,r={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:o,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};function i(){var e=0;a.each(function(){var t=h(this);if(!r.skip_invisible||t.is(":visible"))if(h.abovethetop(this,r)||h.leftofbegin(this,r));else if(h.belowthefold(this,r)||h.rightoffold(this,r)){if(++e>r.failure_limit)return!1}else t.trigger("appear"),e=0})}return t&&(f!==t.failurelimit&&(t.failure_limit=t.failurelimit,delete t.failurelimit),f!==t.effectspeed&&(t.effect_speed=t.effectspeed,delete t.effectspeed),h.extend(r,t)),e=r.container===f||r.container===o?d:h(r.container),0===r.event.indexOf("scroll")&&e.bind(r.event,function(){return i()}),this.each(function(){var o=this,n=h(o);o.loaded=!1,n.attr("src")!==f&&!1!==n.attr("src")||n.is("img")&&n.attr("src",r.placeholder),n.one("appear",function(){if(!this.loaded){if(r.appear){var t=a.length;r.appear.call(o,t,r)}h("<img />").bind("load",function(){var t=n.attr("data-"+r.data_attribute);n.hide(),n.is("img")?n.attr("src",t):n.css("background-image","url('"+t+"')"),n[r.effect](r.effect_speed),o.loaded=!0;var e=h.grep(a,function(t){return!t.loaded});if(a=h(e),r.load){var i=a.length;r.load.call(o,i,r)}}).attr("src",n.attr("data-"+r.data_attribute))}}),0!==r.event.indexOf("scroll")&&n.bind(r.event,function(){o.loaded||n.trigger("appear")})}),d.bind("resize",function(){i()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&d.bind("pageshow",function(t){t.originalEvent&&t.originalEvent.persisted&&a.each(function(){h(this).trigger("appear")})}),h(n).ready(function(){i()}),this},h.belowthefold=function(t,e){return(e.container===f||e.container===o?(o.innerHeight?o.innerHeight:d.height())+d.scrollTop():h(e.container).offset().top+h(e.container).height())<=h(t).offset().top-e.threshold},h.rightoffold=function(t,e){return(e.container===f||e.container===o?d.width()+d.scrollLeft():h(e.container).offset().left+h(e.container).width())<=h(t).offset().left-e.threshold},h.abovethetop=function(t,e){return(e.container===f||e.container===o?d.scrollTop():h(e.container).offset().top)>=h(t).offset().top+e.threshold+h(t).height()},h.leftofbegin=function(t,e){return(e.container===f||e.container===o?d.scrollLeft():h(e.container).offset().left)>=h(t).offset().left+e.threshold+h(t).width()},h.inviewport=function(t,e){return!(h.rightoffold(t,e)||h.leftofbegin(t,e)||h.belowthefold(t,e)||h.abovethetop(t,e))},h.extend(h.expr[":"],{"below-the-fold":function(t){return h.belowthefold(t,{threshold:0})},"above-the-top":function(t){return!h.belowthefold(t,{threshold:0})},"right-of-screen":function(t){return h.rightoffold(t,{threshold:0})},"left-of-screen":function(t){return!h.rightoffold(t,{threshold:0})},"in-viewport":function(t){return h.inviewport(t,{threshold:0})},"above-the-fold":function(t){return!h.belowthefold(t,{threshold:0})},"right-of-fold":function(t){return h.rightoffold(t,{threshold:0})},"left-of-fold":function(t){return!h.rightoffold(t,{threshold:0})}})}(jQuery,window,document);
//# sourceMappingURL=/js/maps/post.js.map
