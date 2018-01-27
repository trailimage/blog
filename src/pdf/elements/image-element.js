'use strict';

const TI = require('../../');
const ElementBase = TI.PDF.Element.Base;
const config = TI.config;
const is = TI.is;
const db = TI.active;
const request = require('request');

/**
 * @namespace TI.PDF.Element.Image
 * @extends ElementBase
 */
class ImageElement extends ElementBase {
   /**
    * @param {String} [style] pdf-style.json rule
    */
   constructor(style) {
      super(style === undefined ? 'image' : style);
      /**
       * Original image parameters from source
       * @type TI.PhotoSize
       */
      this.original = null;
   }

   /**
    * Whether image is portrait orientation
    * @returns {Boolean}
    */
   get isPortrait() {
      return (
         this.original !== null && this.original.height > this.original.width
      );
   }

   /**
    * @param {TI.PDF.Element.Area} container
    */
   scale(container) {
      switch (this.scaleTo) {
         case TI.PDF.Scale.Fit:
            this.fit(container);
            break;
         case TI.PDF.Scale.Fill:
            this.fill(container);
            break;
         default:
            super.scale(container);
            break;
      }
   }

   /**
    * Calculate new dimensions that fit within given boundaries
    * @param {TI.PDF.Element.Area} container
    */
   fit(container) {
      let w = TI.PDF.pixelsToInches(this.original.width);
      let h = TI.PDF.pixelsToInches(this.original.height);

      if (w < container.width && h < container.height) {
         // fits at full size
         this.width = w;
         this.height = h;
      } else {
         // shrink
         let widthRatio = container.width / w;
         let heightRatio = container.height / h;

         if (widthRatio < heightRatio) {
            // width needs to shrink more
            this.width = container.width;
            this.height = h * widthRatio;
            this.left = 0;
         } else {
            this.height = container.height;
            this.width = w * heightRatio;
            this.top = 0;
         }
      }
   }

   /**
    * Calculate dimensions and offsets to fill boundary
    * @param {TI.PDF.Element.Area} container
    */
   fill(container) {
      let w = TI.PDF.pixelsToInches(this.original.width);
      let h = TI.PDF.pixelsToInches(this.original.height);
      let ratio = 1;

      if (w < container.width || h < container.height) {
         // need to stretch
         let widthRatio = container.width / w;
         let heightRatio = container.height / h;
         // grow by ratio needing to expand most
         ratio = widthRatio > heightRatio ? widthRatio : heightRatio;
      }

      this.width = w * ratio;
      this.height = h * ratio;
      // offset to center
      this.center(container.width);
      this.top = (container.height - this.height) / 2;
   }

   /**
    * @param {TI.PDF.Layout} layout
    * @param {function} callback
    */
   render(layout, callback) {
      this.explicitLayout(layout, this.area);

      let p = this.area.pixels;

      getImage(this.original.url, buffer => {
         layout.pdf.image(buffer, p.left, p.top, {
            width: p.width,
            height: p.height
         });
         callback();
      });
   }
}

module.exports = ImageElement;

// - Private static members ---------------------------------------------------

/**
 * Load image bytes
 * @param {String} url
 * @param {function(Buffer)} callback
 */
function getImage(url, callback) {
   // null encoding defaults to binary Buffer
   let options = { url: url, encoding: null };

   if (!is.empty(config.proxy)) {
      options.proxy = config.proxy;
   }

   request(options, (error, response, data) => {
      if (error !== null) {
         db.log.ERROR('%s when accessing %s', error.toString(), url);
      } else {
         callback(data);
      }
   });
}
