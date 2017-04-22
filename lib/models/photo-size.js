const is = require('./is');

/**
 * @param {object} json
 * @param {string|string[]} sizeField Size or list of size field names in order of preference
 * @returns {Size|object}
 */
function make(json, sizeField) {
   const size = {
      url: null,
      width: 0,
      height: 0,
      // whether size is empty
      get isEmpty() { return this.url === null && this.width === 0; }
   };
   let field = null;

   if (is.array(sizeField)) {
      // iterate through size preferences to find first that isn't empty
      for (field of sizeField) {
         // break with given size url assignment if it exists in the photo summary
         if (!is.empty(json[field])) { break; }
      }
   } else {
      field = sizeField;
   }

   if (field !== null) {
      const suffix = field.remove('url');

      if (!is.empty(json[field])) {
         size.url = json[field];
         size.width = parseInt(json['width' + suffix]);
         size.height = parseInt(json['height' + suffix]);
      }
   }
   return size;
}

module.exports = { make };