/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts" />
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/**
 * Defined in /views/post.hbs
 */
declare const pageFeatures: PageFeature

/**
 * Only load scripts and data for the current view port and features.
 */
$(function() {
   /** Whether mobile resources have been loaded */
   let mobileLoaded = false
   /** Whether desktop resources have been loaded */
   let desktopLoaded = false
   const $view = $(window)
   let timer = 0
   /** Page width below which mobile rather than desktop resources will be loaded */
   const breakAt = 1024
   // default features
   const feature: PageFeature = {
      facebook: false,
      timestamp: 0
   }

   // incorporate features set by page
   $.extend(feature, pageFeatures)
   $view.on('resize', resizeHandler)

   // always check on first load
   checkResources()

   /**
    * Load different resources if view size crosses break boundary
    */
   function resizeHandler() {
      if (mobileLoaded && desktopLoaded) {
         // no need to check after everything is loaded
         $view.off('resize')
      } else {
         if (timer > 0) window.clearTimeout(timer)
         timer = window.setTimeout(checkResources, 500)
      }
   }

   /**
    * Load resources based on current view width.
    */
   function checkResources() {
      const width = $view.width()
      if (width === undefined || width > breakAt) {
         loadDesktop()
      } else {
         loadMobile()
      }
   }

   /**
    * Lazy-load mobile resources
    */
   function loadMobile() {
      if (mobileLoaded) return

      const imageStyle = { width: '100%', height: 'auto' }

      // could be optimized into a lazy-load
      $('#mobile-menu').load('/mobile-menu?t=' + feature.timestamp, () => {
         $.getScript('/js/mobile-menu.js?t=' + feature.timestamp)
      })

      // make post images fill width
      $('figure, .category.content a.thumb').each(function(this: HTMLElement) {
         $(this)
            .css(imageStyle)
            .find('img')
            .css(imageStyle)
      })

      mobileLoaded = true
   }

   /**
    * Lazy-load desktop resources. Append timestamp to break caches.
    */
   function loadDesktop() {
      if (desktopLoaded) {
         return
      }

      // could be optimized into a lazy-load
      $('#category-menu')
         .load('/category-menu?t=' + feature.timestamp)
         .on('change', 'select', e => {
            window.location.assign($(e.target).val() as string)
         })

      if (feature.facebook) {
         loadSource(
            'facebook-jssdk',
            '//connect.facebook.net/en_US/all.js#xfbml=1&appId=110860435668134',
            true
         )
      }

      desktopLoaded = true
   }

   /**
    * jQuery getScript() might work but this is the pattern both Facebook and
    * Twitter employ.
    */
   function loadSource(id: string, url: string, async: boolean = false) {
      let js
      const firstScript = document.getElementsByTagName('script')[0]

      if (!document.getElementById(id)) {
         if (async === undefined) async = false

         js = document.createElement('script')
         js.id = id
         js.src = url
         js.async = async

         const parent = firstScript.parentNode

         if (parent === null) {
            console.error('Failed to load script source')
         } else {
            parent.insertBefore(js, firstScript)
         }
      }
   }
})
