/** @type {MockRequest} */
module.exports = {
   referer: null,
   params: {},
   headers: {},
   connection: { remoteAddress: '' },
   // added by Express body parser
   body: { selected: [] },
   get(field) {
      return this[field];
   },
   header(name) {
      return this.headers[name];
   },
   reset() {
      this.referer = null;
      this.params = {};
      this.headers = {};
      this.connection = { remoteAddress: '' };
      this.body = { selected: [] };
      return this;
   }
};
