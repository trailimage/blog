"use strict";$(function(){var o="selected",a=$("#status"),e=$("#letters"),t=$("#selectors"),s=$("#thumbs"),i="item-"+selectedTag.substr(0,1).toLowerCase(),l=t.find("#"+i),r=e.find("li[data-for="+i+"]");function n(o){if(o&&"-"!=o){var e="/photo-tag/search/"+o;a.html("Retrieving images &hellip;"),s.load(e,function(e,t){a.empty(),"error"===t&&(s.empty(),alert('Sorry about that. Looking for "'+o+'" photos caused an error.')),window.scrollTo(0,0)})}else s.empty(),a.empty()}l.val(selectedTag).show(),r.addClass(o),n(selectedTag),e.find("li").click(function(){r.removeClass(o),(r=$(this)).addClass(o),l.hide(),(l=$("#"+r.data("for"))).show();var e=l.find("option");if(2==e.length){var t=e[1].value;l.val(t),n(t)}else s.empty(),a.html("Waiting for selection &hellip;")}),t.on("change","select",function(e){e.stopPropagation(),e.preventDefault();var t=l.val();n(t),t&&"-"!=t&&window.history.pushState(null,siteName+' photos tagged with "'+t+'"',"/photo-tag/"+t)})});
//# sourceMappingURL=/js/maps/photo-tag.js.map
