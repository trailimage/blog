import util from 'util';
import { HttpStatus, is, merge, Header, MimeType, Encoding } from '@toba/tools';

export default class Response {
   httpStatus = HttpStatus.OK;
   /**
    * Method to call when response is complete. Can be assigned as test
    * middleware next() method so that response.end() and middelware next()
    * are both captured
    */
   onEnd: () => void;
   /** Whether response should be ended after render is called */
   endOnRender = true;
   ended = false;
   headers: { [key: string]: string };
   content: string = null;
   rendered: {
      template: string;
      options: null;
      json: string;
   };
   redirected: {
      status: HttpStatus;
      url: string;
   };

   constructor() {
      this.reset();
   }

   status(value: HttpStatus) {
      this.httpStatus = value;
      return this;
   }

   setHeader(key, value) {
      this.headers[key] = value;
      return this;
   }

   /**
    * Set header value(s)
    */
   set(keyOrHash, value) {
      if (value !== undefined) {
         this.headers[keyOrHash] = value;
      } else if (typeof keyOrHash == is.Type.Object) {
         Object.assign(this.headers, keyOrHash);
      }
   }

   redirect(status: HttpStatus, url: string) {
      this.redirected.status = status;
      this.redirected.url = url;
      this.end();
   }

   /**
    * Method added by Express
    */
   json(o) {
      this.httpStatus = HttpStatus.OK;
      this.rendered.json = o;
      return this.setHeader(Header.Content.Type, MimeType.JSON).end();
   }

   /**
    * Serialize render options rather than actually rendering a view
    */
   render(template: string, options, callback) {
      delete options['config'];
      this.rendered.template = template;
      this.rendered.options = options;

      if (is.callable(callback)) {
         callback(null, util.inspect(this.rendered));
      }
      if (this.endOnRender) {
         this.end();
      }
   }

   /**
    * @see https://nodejs.org/api/stream.html#stream_class_stream_writable
    */
   write(chunk: string | Buffer, encoding = Encoding.UTF8, callback) {
      const text = Buffer.isBuffer(chunk) ? chunk.toString(encoding) : chunk;
      this.content = this.content === null ? text : this.content + text;
      if (is.callable(callback)) {
         callback();
      }
      return true;
   }

   end() {
      if (!this.ended) {
         this.ended = true;
         if (is.callable(this.onEnd)) {
            this.onEnd();
         }
      }
      return this;
   }

   reset() {
      this.httpStatus = HttpStatus.OK;
      this.onEnd = null;
      this.ended = false;
      this.headers = {};
      this.content = null;
      this.endOnRender = true;
      this.rendered = {
         template: null,
         options: null,
         json: null
      };
      this.redirected = {
         status: null,
         url: null
      };
      return this;
   }
}
