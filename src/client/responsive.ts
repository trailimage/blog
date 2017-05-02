/// <reference types="jquery" />

//import { PageFeature } from '../types/';

/**
 * Which features to enable on a page — determines which libraries to lazy-load
 */
declare interface PageFeature {
   sideMenu:boolean;
   postMenu:boolean;
   twitter:boolean;
   facebook:boolean;
   timestamp:number;
}

/**
 * Defined in /views/post.hbs
 */
declare const pageFeatures:PageFeature;

/**
 * Only load scripts and data for the current view port and features
 */
$(function() {
   /** Whether mobile resources have been loaded */
   let mobileLoaded = false;
   /** Whether desktop resources have been loaded */
   let desktopLoaded = false;
   const $view = $(window);
   let timer = 0;
   /** Page width below which mobile rather than desktop resources will be loaded */
   const breakAt = 1024;
   // default features
   const feature:PageFeature = { sideMenu: true, postMenu: true, twitter: true, facebook: false, timestamp: 0 };

   // incorporate features set by page
   $.extend(feature, pageFeatures);
   $view.on('resize', resizeHandler);

   // always check on first load
   checkResources();

   /**
    * Load different resources if view size crosses break boundary
    */
   function resizeHandler() {
      if (mobileLoaded && desktopLoaded) {
         // no need to check after everything is loaded
         $view.off('resize');
      } else {
         if (timer > 0) { window.clearTimeout(timer); }
         timer = window.setTimeout(checkResources, 500);
      }
   }

   /**
    * Load resources based on current view width
    */
   function checkResources() {
      if ($view.width() > breakAt) {
         loadDesktop();
      } else {
         loadMobile();
      }
   }

   /**
    * Lazy-load mobile resources
    */
   function loadMobile() {
      if (mobileLoaded) { return; }

      // could be optimized into a lazy-load
      $('#mobile-menu').load('/mobile-menu', ()=> {
         $.getScript('/js/mobile-menu.js');
      });

      mobileLoaded = true;
   }

   /**
    * Lazy-load desktop resources
    */
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
    */
   function loadSource(id:string, url:string, async:boolean = false) {
      let js;
      const firstScript = document.getElementsByTagName('script')[0];

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
