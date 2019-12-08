/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts" />
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>
/// <reference path="./lazy-load.ts"/>

interface JQuery {
   lazyload(options?: LazyLoadOptions): any;
}

/**
 * Set up lazy loading and light box for post images. Depends on post images
 * having data-src, data-big, data-big-width and data-big-height
 * attributes.
 *
 * @see http://www.appelsiini.net/projects/lazyload
 */
$(function() {
   const $photos = $('figure');
   const $lb = $('#light-box');

   // clicking on lightbox hides it and re-enables page scroll
   $lb.on('click', () => {
      $lb.off('mousemove').hide(0, enablePageScroll);
   });

   // clicking an image opens it in a lightbox
   $photos
      .find('img')
      .on('click touchstart', lightBox)
      .lazyload();

   // hovering photo info button loads camera detail
   $photos.find('.info-button').one('mouseover', function(this: Element) {
      const $button = $(this);
      $button
         .addClass('loading')
         .html(iconHtml('cloud_download', 'Loading …'))
         .load($button.parent().data('exif'), function() {
            $button.removeClass('loading').addClass('loaded');
         });
   });

   /**
    * Material icon HTML
    */
   function iconHtml(name: string, text: string): string {
      return util.html.icon(name).get(0).outerHTML + '<p>' + text + '</p>';
   }

   /**
    * Simple light box for clicked image. Post image has HTML data attributes
    * defining the big image URL and dimensions.
    */
   function lightBox(this: EventTarget, event: JQuery.Event) {
      event.preventDefault();

      /** Post image */
      const $img = $(this);
      /** Big image */
      const $big = $lb.find('img');
      /** Whether big image is already browser cached */
      let loaded: boolean = $img.data('big-loaded');
      const isTouch = event.type == 'touchstart';

      const size = new Size($img.data('big-width'), $img.data('big-height'));
      /** click position relative to image corner */
      const fromCorner = { top: 0, left: 0 };

      /**
       * Update image position and panning speed to accomodate window size
       */
      const updateSize = (event: JQuery.Event) => {
         let cursor = 'zoom-out';

         size.update();

         if (isTouch) {
            $lb.on('touchstart', beginDrag);
            $lb.on('touchmove', updateDragPosition);
            centerImage();
         } else if (size.needsToPan) {
            cursor = 'move';
            $lb.on('mousemove', updateHoverPosition);
         } else {
            $lb.off('mousemove', updateHoverPosition);
         }
         // set initial desktop position and cursor
         if (!isTouch) {
            updateHoverPosition(event);
            $big.css('cursor', cursor);
         }
      };

      /**
       * Update image position within light box
       */
      const updateHoverPosition = (event: JQuery.Event) => {
         const x = event.clientX;
         const y = event.clientY;

         if (x !== undefined && y !== undefined) {
            const dx = size.width.offset(x);
            const dy = size.height.offset(y);
            $big.css({ transform: `translate(${dx}px, ${dy}px)` });
         }
      };

      const centerImage = () => {
         const dx = size.width.center();
         const dy = size.height.center();
         $big.css({ transform: `translate(${dx}px, ${dy}px)` });
      };

      const firstTouch = (
         event: JQuery.Event | TouchEvent
      ): [number, number] => {
         let x = 0;
         let y = 0;
         const touches = event.targetTouches;

         if (touches !== undefined) {
            x = touches[0].clientX;
            y = touches[0].clientY;
         }
         return [x, y];
      };

      const beginDrag = (event: JQuery.Event | TouchEvent) => {
         const imageAt = $big.position();
         const [touchX, touchY] = firstTouch(event);

         fromCorner.left = imageAt.left - touchX;
         fromCorner.top = imageAt.top - touchY;
      };

      const updateDragPosition = (event: JQuery.Event) => {
         const [touchX, touchY] = firstTouch(event);
         const dx = fromCorner.left + touchX;
         const dy = fromCorner.top + touchY;

         $big.css({ transform: `translate(${dx}px, ${dy}px)` });
      };

      if (loaded === undefined) {
         loaded = false;
      }

      if (loaded) {
         // assign directly if big image has already been loaded
         $big.attr('src', $img.data('big'));
      } else {
         // assign lower resolution image while the bigger one is loading
         $big.attr('src', $img.data('src'));
         // load photo in detached element
         $('<img />')
            .bind('load', function(this: HTMLImageElement) {
               // assign big image to light box once it's loaded
               $big.attr('src', this.src);
               $img.data('big-loaded', true);
            })
            .attr('src', $img.data('big'));
      }

      $big.height(size.height.image).width(size.width.image);

      // position based on initial click
      updateSize(event as JQuery.Event);

      $lb.show(0, disablePageScroll);

      // update panning calculations if window resizes
      $(window).resize(updateSize);
   }

   function disablePageScroll() {
      $('html').css({ overflow: 'hidden' });
   }

   function enablePageScroll() {
      $(window).off('resize');
      $('html').css({ overflow: 'auto' });
   }

   /**
    * ```
    *  ╔════════╤════════════════╗
    *  ║        │ extra          ║
    *  ║   ╔════╧═══╤════════╗   ║
    *  ║   ║        │ from   ║   ║
    *  ║   ║        ┼ center ║   ║
    *  ║   ║ window          ║   ║
    *  ║   ╚═════════════════╝   ║
    *  ║ image                   ║
    *  ╚═════════════════════════╝
    * ```
    * Represent image width or height dimension compared to the window to
    * calculate panning amount and speed.
    */
   class Length {
      /** Image edge length */
      image: number;
      /** Window edge length */
      window: number;
      /** How much longer is window edge (usually a negative number) */
      extra: number;
      /** Ratio of mouse to image movement pixels for panning */
      panRatio: number;

      constructor(forImage: string) {
         this.image = parseInt(forImage);
         this.window = 0;
         this.extra = 0;
         this.panRatio = 0;
      }

      /**
       * Update window dimension and calculate how much larger it is than image.
       */
      update(forWindow: number) {
         this.window = forWindow;
         this.extra = (this.window - this.image) / 2;
      }

      /**
       * Calculate ratio for this dimension. Leading number is factor by which
       * to accelerate panning so edge of image is visible before cursor
       * reaches edge of window.
       */
      ratio(): number {
         return 2 * ((this.window - this.image) / this.window);
      }

      /**
       * Get image offset based on mouse position.
       * @param m Current mouse position in this dimension
       */
      offset(m: number): number {
         const subtract =
            this.extra > 0 ? 0 : (this.window / 2 - m) * this.panRatio;

         return this.extra - subtract;
      }

      /**
       * Get image offset necessary to center the image.
       */
      center(): number {
         return this.extra / 2;
      }
   }

   /**
    * Represent image size.
    */
   class Size {
      width: Length;
      height: Length;
      /** Whether image needs to pan */
      needsToPan: boolean;

      constructor(imageWidth: string, imageHeight: string) {
         this.width = new Length(imageWidth);
         this.height = new Length(imageHeight);
      }

      /**
       * Update calculations if window is resized.
       */
      update() {
         this.height.update(window.innerHeight);
         this.width.update(window.innerWidth);
         this.needsToPan = this.width.extra < 0 || this.height.extra < 0;

         if (this.needsToPan) {
            // pan image using length with biggest ratio
            // or if one dimension needs no panning then use the other dimension
            this.height.panRatio = this.width.panRatio =
               this.width.extra < this.height.extra && this.width.extra < 0
                  ? this.width.ratio()
                  : this.height.ratio();
         }
      }
   }
});
