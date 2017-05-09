module.exports = {
   title: null,
   author: null,
   /**
    * Registered fonts
    * @type {object.<string, string>}
    */
   fonts: {},
   x: 0,
   y: 0,
   /** @type string */
   _font: null,
   /** @type number */
   _fontSize: 0,
   /** @type number[] */
   _fillColor: [],
   /**
    * @param {string} name
    * @param {string} path
    * @param {string} [family]
    */
   registerFont(name, path, family) { this.fonts[name] = path;	},

   /**
    * @param {object} options
    */
   addPage(options) {

   },

   /** @param {string} f */
   font(f) { this._font = f; },

   /** @param {number} s */
   fontSize(s) { this._fontSize = s; }
};