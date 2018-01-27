'use strict';

const PDFPage = require('./../pdf-page.js');
const PhotoWell = require('../elements/photo-well.js');
const PhotoCaption = require('../elements/photo-caption.js');

/**
 * @extends PDFPage
 * @extends ElementGroup
 * @extends PDFElement
 */
class PhotoPage extends PDFPage {
   /**
    * @param {Number} number
    */
   constructor(number) {
      super('photoPage', number);

      /** @type PhotoWell */
      this.photoWell = null;
      /** @type PhotoCaption */
      this.caption = null;
   }

   /**
    * @param {Photo} photo
    * @returns {PhotoWell}
    */
   addPhoto(photo) {
      let w = new PhotoWell();

      w.addImage(photo.size.normal);
      w.addText(photo.title);

      this.photoWell = this.add(w);

      return this.photoWell;
   }

   /**
    *
    * @param {String} text
    * @returns {PhotoCaption}
    */
   addCaption(text) {
      this.caption = this.add(new PhotoCaption(text));
      return this.caption;
   }

   /**
    * @param {PDFLayout} layout
    */
   updateLayout(layout) {
      super.implicitLayout(layout);

      if (this.photoWell.image.isPortrait) {
         this._sideBySideLayout(layout);
      } else {
         this._stackLayout(layout);
      }
   }

   /**
    * Photo well is above, resized to make room for caption
    * @param {PDFLayout} layout
    * @private
    */
   _stackLayout(layout) {
      let c = this.caption;
      let p = this.photoWell;

      // caption is aligned to left margin and takes full page width
      c.left = this.margin.left;
      c.width = this.width - (this.margin.left + this.margin.right);
      c.calculateHeight(layout);

      p.width = this.width;
      p.height = this.height - (c.height + c.margin.top + c.margin.bottom);

      // calculate top based on image size
      c.top = p.height + c.margin.bottom;

      p.image.center(this.width);

      //if (this.image.left > 0) {
      // add background to fill marginal space
      //let rect = this.add(new RectangleElement(this.size));
      //rect.zIndex = 1;
      //// position image above background
      //this.image.zIndex = 10;
      //}
   }

   /**
    * Photo well is beside caption, resized only if it doesn't allow caption minimum width
    * @param {PDFLayout} layout
    * @private
    */
   _sideBySideLayout(layout) {
      let c = this.caption;
      let p = this.photoWell;
      let minWidth = c.minWidth + c.margin.left + c.margin.right;

      // calculate left based on image size
      p.image.fit(this.width - minWidth, this.height);

      c.left = p.width + c.margin.left + c.margin.right;
      //C.width = this.width - (well.width + (3 * this.book.textMargin));
      c.calculateHeight(layout);
      // center vertically
      c.top = Math.round((this.height - c.height) / 2);
   }
}

module.exports = PhotoPage;
