"use strict";$(function(){function e(e){e.submit(function(){var n="select, button",t=e.find("select"),i=e.find("input[name=include-related]"),s="true"==e.find("input[name=remove-matches]").val(),a={selected:t.val(),includeRelated:i.length>0&&i.is(":checked")};return e.find(n).prop("disabled",!0),e.css("cursor","wait"),e.find(".message").hide(),$.post(e.attr("action"),a,function(i){if(e.find(n).prop("disabled",!1),e.css("cursor","auto"),i.success){var a=i.message.split(",");if(s)for(var d=0;d<a.length;d++)t.find('option[value="'+a[d]+'"]').remove();window.alert(a.length>0&&""!=a[0]?"Keys Affected:\n"+a.join("\n"):"No new data found")}else e.find(".message").html("Failed").show()}),!1})}e($("#json")),e($("#library")),e($("#views")),e($("#maps"))});