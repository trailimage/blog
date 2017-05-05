/// <reference types="google.analytics" />
/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts" />

/**
 * Set up lazy loading and light box for post images. Depends on post images
 * having data-original, data-big, data-big-width and data-big-height
 * attributes.
 *
 * http://www.appelsiini.net/projects/lazyload
 */
$(function() {
   const eventCategory = 'Post';
   const $photos = $('figure');
   const $lb = $('#light-box');

   // clicking on lightbox hides it and re-enables page scroll
   $lb.on('click', ()=> { $lb.off('mousemove').hide(0, enablePageScroll); });

   // clicking an image opens it in a lightbox
   $photos.find('img').on('click', lightBox).lazyload();

   // tapping mobile info button loads camera detail
   $photos.find('.mobile-button').on('touchstart', function(this:HTMLElement) {
      const $m = $(this);
      const $fig = $m.parent();
      const content = $m.html();

      $m.addClass('loading').html(iconHtml('hourglass', '…'));

      $('<div/>')
         .addClass('mobile-info')
         .load($fig.data('exif'), function(this:HTMLElement) {
            const $info = $(this);
            $m.hide().removeClass('loading').html(content);
            $info
               .appendTo($fig)
               .one('touchstart', function(event) {
                  event.stopPropagation();
                  event.preventDefault();
                  $info.hide();
                  $m.show();
               });
         });

      ga('send', 'event', eventCategory, 'Show Photo Info', 'Mobile');
   });

   // hovering photo info button loads camera detail
   $photos.find('.info-button').one('mouseover', function(this:Element) {
      const $button = $(this);
      $button
         .addClass('loading')
         .html(iconHtml('cloud_download', 'Loading …'))
         .load($button.parent().data('exif'), function() {
            $button.removeClass('loading').addClass('loaded');
         });

      ga('send', 'event', eventCategory, 'Show Photo Info');
   });

   /**
    * Material icon HTML
    */
   function iconHtml(name:string, text:string):string {
      return '<i class="material-icons ' + name + '">' + name + '</i><p>' + text + '</p>';
   }

   /**
    * Simple light box for clicked image
    * Post image has HTML data attributes defining the big image URL and dimensions
    */
   function lightBox(this:HTMLElement, event:JQueryMouseEventObject) {
      /** Post image */
      const $img = $(this);
      /** Big image */
      const $big = $lb.find('img');
      /** Whether big image is already browser cached */
      let loaded:boolean = $img.data('big-loaded');

      const size = new Size($img.data('big-width'), $img.data('big-height'));
      /** click position relative to image corner */
      const fromCorner = { top: 0, left: 0 };

      /**
       * Update image position and panning speed to accomodate window size
       */
      const updateSize = function(event:JQueryEventObject) {
         let cursor = 'zoom-out';

         size.update();

         if (size.needsToPan) {
            cursor = 'move';
            $lb.on('mousemove', updateHoverPosition);
            $lb.on('touchstart', beginDrag);
            $lb.on('touchmove', updateDragPosition);
         } else {
            $lb.off('mousemove', updateHoverPosition);
            $lb.off('touchstart', beginDrag);
            $lb.off('touchmove', updateDragPosition);
         }
         // set initial position
         updateHoverPosition(event);
         $big.css('cursor', cursor);
      };

      /**
       * Update image position within light box
       */
      const updateHoverPosition = function(event:JQueryEventObject) {
         $big.css({
            top: size.height.CSS(event.clientY),
            left: size.width.CSS(event.clientX)
         });
      };

      const beginDrag = function(event:JQueryEventObject|TouchEvent) {
         const touchAt = event.targetTouches[0];
         const imageAt = $big.position();

         fromCorner.left = imageAt.left - touchAt.clientX;
         fromCorner.top = imageAt.top - touchAt.clientY;
      };

      const updateDragPosition = function(event:JQueryEventObject) {
         // ignore multi-finger touches
         const at = event.targetTouches[0];

         $big.css({
            top: fromCorner.top + at.clientY,
            left: fromCorner.left + at.clientX
         });
      };

      if (loaded === undefined) { loaded = false; }

      if (loaded) {
         // assign directly if big image has already been loaded
         $big.attr('src', $img.data('big'));
      } else {
         // assign lower resolution image while the bigger one is loading
         $big.attr('src', $img.data('original'));
         // load photo in detached element
         $('<img />')
            .bind('load', function(this:HTMLImageElement) {
               // assign big image to light box once it's loaded
               $big.attr('src', this.src);
               $img.data('big-loaded', true);
            })
            .attr('src', $img.data('big'));
      }

      $big.height(size.height.image).width(size.width.image);


      // position based on initial click
      updateSize(event as JQueryEventObject);

      $lb.show(0, disablePageScroll);
      // update panning calculations if window resizes
      $(window).resize(updateSize);

      ga('send', 'event', eventCategory, 'Show Lightbox');
   }

   function disablePageScroll() {
      $('html').css('overflow', 'hidden');
      // prevent iOS from dragging page underneath image
      document.ontouchmove = function(event) { event.preventDefault(); };
   }

   function enablePageScroll() {
      $('html').css('overflow', 'auto');
      $(window).off('resize');
      document.ontouchmove = null;
   }

   /**
    *  ╔════════╤════════════════╗
    *  ║        │ extra          ║
    *  ║   ╔════╧═══╤════════╗   ║
    *  ║   ║        │ from   ║   ║
    *  ║   ║        ┼ center ║   ║
    *  ║   ║ window          ║   ║
    *  ║   ╚═════════════════╝   ║
    *  ║ image                   ║
    *  ╚═════════════════════════╝
    *  Pan ratio maps mouse position from window center to the number of pixels
    *  to offset against the image overlap
    */
   class Length {
      constructor(forImage:string) {
         this.image = parseInt(forImage);
         this.window = 0;
         this.extra = 0;
         this.panRatio = 0;
      }
      /** Image edge length */
      image:number;
      /** Window edge length */
      window:number;
      /** How much longer is window edge (usually a negative number) */
      extra:number;
      /** Ratio of mouse to image movement pixels for panning */
      panRatio:number;

      /**
       * Update window dimension and calculate how much larger it is than image
       */
      update(forWindow:number) {
         this.window = forWindow;
         this.extra = (this.window - this.image) / 2;
      }

      /**
       * Calculate ratio for this dimension. Leading number is factor by which
       * to accelerate panning so edge of image is visible before cursor
       * reaches edge of window.
       */
      ratio():number {
         return 2 * ((this.window - this.image) / this.window);
      }

      /**
       * Get CSS image offset based on mouse position
       */
      CSS(m:number):string {
         const subtract = (this.extra > 0) ? 0 : ((this.window / 2) - m) * this.panRatio;
         return (this.extra - subtract).toFixed(0) + 'px';
      }
   }

   class Size {
      constructor(imageWidth:string, imageHeight:string) {
         this.width = new Length(imageWidth);
         this.height = new Length(imageHeight);
      }

      width:Length;
      height:Length;
      /** Whether image needs to pan */
      needsToPan:boolean;

      update() {
         this.height.update(window.innerHeight);
         this.width.update(window.innerWidth);
         this.needsToPan = this.width.extra < 0 || this.height.extra < 0;

         if (this.needsToPan) {
            // pan image using length with biggest ratio
            // or if one dimension needs no panning then use the other dimension
            this.height.panRatio = this.width.panRatio = (this.width.extra < this.height.extra && this.width.extra < 0)
               ? this.width.ratio()
               : this.height.ratio();
         }
      }
   }
});