"use strict";$(function(){function t(t,n){var o=r.find(".glyphicon-chevron-up"),i=r.find(".glyphicon-chevron-down"),e=function(){r.addClass(l),p.show(),o.show(),i.hide()},a=function(){r.removeClass(l),p.hide(),o.hide(),i.show()};t&&t.stopPropagation(),void 0===n&&(n=r.hasClass(l)),n?a():e()}function n(){var n=$(this).data("slug");"undefined"!=typeof loadPostTrack?loadPostTrack(n):window.location.href="/"+n,t()}function o(t,n,o,i){t.find("li").removeClass(l),o(i),n.addClass(l),s(i)}function i(t){var n=TrailImage.menu[t[0]];d.empty(),null==t[1]&&(t[1]=n[0].title);for(var o=0;o<n.length;o++){var i=$("<li>").text(n[o].title);d.append(i),n[o].title==t[1]&&(i.addClass(l),e(t))}}function e(t){var n=TrailImage.menu[t[0]];u.empty();for(var o=0;o<n.length;o++)if(n[o].title==t[1])for(var i=n[o].posts,e=0;e<i.length;e++){var a=TrailImage.post[i[e]],s=a.title;if(a.part&&e<i.length-1&&s==TrailImage.post[i[e+1]].title){for(var l=$("<ol>");e<i.length&&TrailImage.post[i[e]].title==s;)a=TrailImage.post[i[e]],l.prepend($("<li>").addClass("post").attr("value",a.part).html(a.subTitle).data("description",a.description).data("slug",a.slug)),e++;e--,a=TrailImage.post[i[e]],u.append($("<li>").addClass("series").html('<span class="mode-icon '+a.icon+'"></span>'+a.title).append(l))}else a.part&&(s+=": "+a.subTitle),u.append($("<li>").addClass("post").html('<span class="mode-icon '+a.icon+'"></span>'+s).data("description",a.description).data("slug",a.slug))}}function a(t){var n=new RegExp("\\bmenu=([^;\\b]+)","gi"),o=n.exec(document.cookie);return null===o?t:o[1].split(",")}function s(t){"string"==typeof t&&(t=[t,null]),document.cookie="menu="+t.join()}var l="selected",r=$("#post-menu-button"),p=$("#post-menu"),c=$("#menu-roots"),d=$("#menu-tags"),u=$("#menu-posts"),m=$("#post-description"),f=a(["When",null]);r.one("click",function(){for(var t in TrailImage.menu){var n=$("<li>").text(t);c.append(n),t==f[0]&&(n.addClass(l),i(f))}}).click(t),c.on("click","li",function(t){t.stopPropagation();var n=$(this);f=[n.text(),null],o(c,n,i,f)}),d.on("click","li",function(t){t.stopPropagation();var n=$(this);f[1]=n.text(),o(d,n,e,f)}),u.on("click","li.post",n).on("mouseover","li.post",function(){m.html($(this).data("description"))}).on("mouseout",function(){m.empty()}),$("html").click(function(n){t(n,!0)})});