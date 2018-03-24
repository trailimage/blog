export default class Request {
   referer: string;
   params: { [key: string]: string };
   headers: { [key: string]: string };
   connection: { remoteAddress: string };

   get(field: string) {
      return this[field];
   }

   header(name: string) {
      return this.headers[name];
   }

   reset() {
      this.referer = null;
      this.params = {};
      this.headers = {};
      this.connection.remoteAddress = '';
      return this;
   }
}
