/**
 * https://github.com/ZJONSSON/node-unzipper
 */
declare module Unzipper {
   interface Options {  
      path: string;
   }

   interface Open {
      file(name:string):Promise<any>;
      url(req:any, url:string):Promise<Buffer>;
   }
}

declare class Unzipper {
   Extract(options:Unzipper.Options):string;
   Parse():any;
   ParseOne():any;
}

declare module "unzipper" {
   export = Unzipper;
}


