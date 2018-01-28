import { Mock } from '../types';

export default {
   referer: null,
   accepts: null,
   params: {},
   headers: {},
   clientIP: null,
   connection: { remoteAddress: '' },
   // added by Express body parser
   body: { selected: [] },

   get(field: string) {
      return this[field];
   },

   header(name: string) {
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
} as Mock.Request;
