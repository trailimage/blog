/**
 * https://github.com/barc/express-hbs
 */
declare module 'express-hbs' {
   export interface Options {
      /**
       * Path to default layout
       */
      defaultLayout?: string;
      /**
       * Absolute path to partials (one path or an array of paths)
       */
      partialsDir?: string;
      i8n?: any;
      /**
       * Extension to use
       */
      extname?: string;
      /**
       * Whether to pretty print HTML
       */
      beautify?: boolean;
      contentHelperName?: string;
      blockHelperName?: string;
      templateOptions?: any;
      handlebars?: any;
      onCompile?: (self: any, source: string, filename: string) => void;
   }

   export interface ExpressHbs {
      create(): ExpressHbs;
      compile(source: string, filename: string): string;
      registerHelper(name: string, fn: Function): void;
      registerPartial(name: string, source: string, filename: string): void;
      registerAsyncHelper(name: string, fn: Function): void;
      loadDefaultLayout(
         useCache: boolean,
         cb: (err: any, templates: string[]) => void
      ): void;
   }

   function express4(options: Options): Function;
}
