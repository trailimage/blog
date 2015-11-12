!function(t,e,i,n){var o=t(e);t.fn.lazyload=function(r){function a(){var e=0;l.each(function(){var i=t(this);if(!d.skip_invisible||i.is(":visible"))if(t.abovethetop(this,d)||t.leftofbegin(this,d));else if(t.belowthefold(this,d)||t.rightoffold(this,d)){if(++e>d.failure_limit)return!1}else i.trigger("appear"),e=0})}var f,l=this,d={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:e,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return r&&(n!==r.failurelimit&&(r.failure_limit=r.failurelimit,delete r.failurelimit),n!==r.effectspeed&&(r.effect_speed=r.effectspeed,delete r.effectspeed),t.extend(d,r)),f=d.container===n||d.container===e?o:t(d.container),0===d.event.indexOf("scroll")&&f.bind(d.event,function(){return a()}),this.each(function(){var e=this,i=t(e);e.loaded=!1,(i.attr("src")===n||i.attr("src")===!1)&&i.is("img")&&i.attr("src",d.placeholder),i.one("appear",function(){if(!this.loaded){if(d.appear){var n=l.length;d.appear.call(e,n,d)}t("<img />").bind("load",function(){var n=i.attr("data-"+d.data_attribute);i.hide(),i.is("img")?i.attr("src",n):i.css("background-image","url('"+n+"')"),i[d.effect](d.effect_speed),e.loaded=!0;var o=t.grep(l,function(t){return!t.loaded});if(l=t(o),d.load){var r=l.length;d.load.call(e,r,d)}}).attr("src",i.attr("data-"+d.data_attribute))}}),0!==d.event.indexOf("scroll")&&i.bind(d.event,function(){e.loaded||i.trigger("appear")})}),o.bind("resize",function(){a()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&o.bind("pageshow",function(e){e.originalEvent&&e.originalEvent.persisted&&l.each(function(){t(this).trigger("appear")})}),t(i).ready(function(){a()}),this},t.belowthefold=function(i,r){var a;return a=r.container===n||r.container===e?(e.innerHeight?e.innerHeight:o.height())+o.scrollTop():t(r.container).offset().top+t(r.container).height(),a<=t(i).offset().top-r.threshold},t.rightoffold=function(i,r){var a;return a=r.container===n||r.container===e?o.width()+o.scrollLeft():t(r.container).offset().left+t(r.container).width(),a<=t(i).offset().left-r.threshold},t.abovethetop=function(i,r){var a;return a=r.container===n||r.container===e?o.scrollTop():t(r.container).offset().top,a>=t(i).offset().top+r.threshold+t(i).height()},t.leftofbegin=function(i,r){var a;return a=r.container===n||r.container===e?o.scrollLeft():t(r.container).offset().left,a>=t(i).offset().left+r.threshold+t(i).width()},t.inviewport=function(e,i){return!(t.rightoffold(e,i)||t.leftofbegin(e,i)||t.belowthefold(e,i)||t.abovethetop(e,i))},t.extend(t.expr[":"],{"below-the-fold":function(e){return t.belowthefold(e,{threshold:0})},"above-the-top":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-screen":function(e){return t.rightoffold(e,{threshold:0})},"left-of-screen":function(e){return!t.rightoffold(e,{threshold:0})},"in-viewport":function(e){return t.inviewport(e,{threshold:0})},"above-the-fold":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-fold":function(e){return t.rightoffold(e,{threshold:0})},"left-of-fold":function(e){return!t.rightoffold(e,{threshold:0})}})}(jQuery,window,document),$(function(){function t(){$("html").css("overflow","hidden")}function e(){$("html").css("overflow","auto")}function i(e){var i=$(this),n=r.find("img"),o=i.data("big-loaded"),a=parseInt(i.data("big-width")),f=parseInt(i.data("big-height")),l=((window.innerHeight-f)/2).toFixed(1),d=((window.innerWidth-a)/2).toFixed(1);e.offsetX/i.width(),e.offsetY/i.height();void 0===o&&(o=!1),o?n.attr("src",i.data("big")):(n.attr("src",i.data("original")),$("<img />").bind("load",function(){n.attr("src",this.src),i.data("big-loaded",!0)}).attr("src",i.data("big"))),n.height(f).width(a).css({top:l+"px",left:d+"px"}),r.show(0,t).on("mousemove",function(t){})}function n(t){var e=$(this),i=e.parent();i.data("exif");$exif.parent().append($("<div>").addClass("exif").html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load($exif.data("url")))}var o=$("figure"),r=$("#light-box");r.on("click",function(){r.off("mousemove").hide(0,e)}),o.find("img").lazyload(),o.find("img").on("click",i),o.find(".mobile-button").on("click",function(){n.call(this)}),o.find(".exif-button").on("mouseover",function(){n.call(this,!0);var t=$(this);t.parent().append($("<div>").addClass("exif").html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load(t.data("url")))})});