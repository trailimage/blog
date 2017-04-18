'use strict';

/**
 * Only load scripts and data for the current view port and features
 */
$(function() {
   var mobileLoaded = false;
   var desktopLoaded = false;
   var $view = $(window);
   var timer = 0;
   var breakAt = 1024;
   // default features
   var feature = { sideMenu: true, postMenu: true, twitter: true, facebook: false, timestamp: 0 };
   // incorporate features set by page
   $.extend(feature, window.feature);
   $view.on('resize', resizeHandler);

   // always check on first load
   checkResources();

   function resizeHandler() {
      if (mobileLoaded && desktopLoaded) {
         // no need to check after everything is loaded
         $view.off('resize');
      } else {
         if (timer > 0) { window.clearTimeout(timer); }
         timer = window.setTimeout(checkResources, 500);
      }
   }

   function checkResources() {
      if ($view.width() > breakAt) {
         loadDesktop();
      } else {
         loadMobile();
      }
   }

   function loadMobile() {
      if (mobileLoaded) { return; }

      // could be optimized into a lazy-load
      $('#mobile-menu').load('/mobile-menu', function() {
         $.getScript('/js/mobile-menu.js');
      });

      mobileLoaded = true;
   }

   function loadDesktop() {
      if (desktopLoaded) { return; }

      // could optimized into a lazy-load
      if (feature.sideMenu) {	$('#category-menu').load('/category-menu'); }

      if (feature.postMenu) {
         // append timestap to defeat caching between site deployments
         $.getScript('/js/post-menu-data.js?t=' + feature.timestamp);
         $.getScript('/js/post-menu.js');
      }

      if (feature.facebook) {
         loadSource('facebook-jssdk', '//connect.facebook.net/en_US/all.js#xfbml=1&appId=110860435668134', true);
      }

      if (feature.twitter) {
         loadSource('twitter-wjs', '//platform.twitter.com/widgets.js');
      }

      desktopLoaded = true;
   }

   /**
    * jQuery getScript() might work but this is the pattern both Facebook and Twitter employ
    * @param {String} id
    * @param {String} url
    * @param {Boolean} [async]
    */
   function loadSource(id, url, async) {
      var js;
      var firstScript = document.getElementsByTagName('script')[0];

      if (!document.getElementById(id)) {
         if (async === undefined) { async = false; }
         js = document.createElement('script');
         js.id = id;
         js.src = url;
         js.async = async;
         firstScript.parentNode.insertBefore(js, firstScript);
      }
   }
});
