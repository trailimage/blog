'use strict';

module.exports = {
   title: null,
   author: null,
   /**
    * Registered fonts
    * @type {Object.<String, String>}
    */
   fonts: {},
   x: 0,
   y: 0,
   /** @type String */
   _font: null,
   /** @type Number */
   _fontSize: 0,
   /** @type Number[] */
   _fillColor: [],
   /**
    * @param {String} name
    * @param {String} path
    * @param {String} [family]
    */
   registerFont(name, path, family) { this.fonts[name] = path;	},

   /**
    * @param {Object} options
    */
   addPage(options) {

   },

   /** @param {String} f */
   font(f) { this._font = f; },

   /** @param {Number} s */
   fontSize(s) { this._fontSize = s; }
};