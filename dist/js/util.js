"use strict";var util={setting:{save:function(t,e){window.localStorage&&localStorage.setItem(t,e)},load:function(t){return window.localStorage?localStorage.getItem(t):null}},html:{icon:function(t,e){var n=$("<i>").addClass("material-icons "+t).text(t);return void 0!==e&&n.click(e),n}},log:{event:function(t,e,n){ga("send","event",t,e,n)}}};
//# sourceMappingURL=/js/maps/util.js.map
