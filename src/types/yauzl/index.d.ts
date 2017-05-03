/**
 * https://github.com/thejoshwolfe/yauzl
 */
declare module "yauzl" {
   export interface Field {
      id:number;
      data:Buffer;
   }

   export interface Entry {
      versionMadeBy:number;
      versionNeededToExtract:number;
      generalPurposeBitFlag:number;
      compressionMethod:number;
      lastModFileTime:number;
      lastModFileDate:number;
      crc32:number;
      compressedSize:number;
      uncompressedSize:number;
      fileNameLength:number;
      extraFieldLength:number;
      fileCommentLength:number;
      internalFileAttributes:number;
      externalFileAttributes:number;
      relativeOffsetOfLocalHeader:number;

      fileName:string;
      extraFields:Field[];
      fileComment:string;

      getLastModDate():Date;
      isCompressed():boolean;
   }

   export interface ZipFile extends NodeJS.EventEmitter {
      /**
       * Causes this `ZipFile` to emit an `entry` or `end` event (or an `error`
       * event). This method must only be called when this `ZipFile` was
       * created with the `lazyEntries` option set to true (see `open()`). When
       * this `ZipFile` was created with the `lazyEntries` option set to true,
       * entry and end events are only ever emitted in response to this method
       * call.
       *
       * The event that is emitted in response to this method will not be
       * emitted until after this method has returned, so it is safe to call
       * this method before attaching event listeners.
       *
       * After calling this method, calling this method again before the
       * response event has been emitted will cause undefined behavior. Calling
       * this method after the `end` event has been emitted will cause
       * undefined behavior. Calling this method after calling `close()` will
       * cause undefined behavior.
       */
      readEntry():void;

      openReadStream(entry:Entry, options:ReadOptions, callback?:EntryCallback):void;
      openReadStream(entry:Entry, callback?:EntryCallback):void;

      close():void;

      isOpen:boolean;
   }

   /**
    * An `err` is provided if the End of Central Directory Record cannot be
    * found, or if its metadata appears malformed. This kind of error usually
    * indicates that this is not a zip file. Otherwise, `zipfile` is an
    * instance of `ZipFile`.
    */
   export type FileCallback = (err:Error, file:ZipFile) => void;

   export type EntryCallback = (err:Error, stream:NodeJS.ReadableStream) => void;

   export interface ReadOptions {
      decompress?:boolean;
      decrypt?:string;
      start?:number;
      end?:number;
   }

   export interface OpenOptions {
      autoClose?:boolean;
      /**
       * Whether entries should be read only when `readEntry()` is called. If
       * `lazyEntries` is `false`, entry events will be emitted as fast as
       * possible to allow `pipe()`ing file data from all entries in parallel.
       * 
       * This is not recommended, as it can lead to out of control memory usage
       * for zip files with many entries. If `lazyEntries` is true, an entry or
       * end event will be emitted in response to each call to readEntry().
       * This allows processing of one entry at a time, and will keep memory
       * usage under control for zip files with many entries.
       */
      lazyEntries?:boolean;

      /**
       * Defaults true and causes yauzl to decode strings with `CP437` or
       * `UTF-8` as required by the spec. The exact effects of turning this
       * option off are:
       * 
       * - `zipfile.comment`, `entry.fileName`, and `entry.fileComment` will
       * be Buffer objects instead of Strings.
       * - Any Info-ZIP Unicode Path Extra Field will be ignored. See
       * `extraFields`.
       * - Automatic file name validation will not be performed. See
       * `validateFileName()`.
       */
      decodeStrings?:boolean;

      /**
       * Defaults true and ensures that an entry's reported uncompressed size
       * matches its actual uncompressed size. This check happens as early as
       * possible, which is either before emitting each "entry" event (for
       * entries with no compression), or during the `readStream` piping after
       * calling `openReadStream()`. See `openReadStream()` for more
       * information on defending against zip bomb attacks.
       */
      validateEntrySizes?:boolean;
   }

   /**
    * Like `fromFd()`, but reads from a RAM buffer instead of an open file.
    * `buffer` is a `Buffer`. If a `ZipFile` is acquired from this method,
    * it will never emit the close event, and calling `close()` is not
    * necessary.
    */
   function fromBuffer(buffer:Buffer, options?:OpenOptions, callback?:FileCallback):void;
   function fromBuffer(buffer:Buffer, callback?:FileCallback):void;

   function open(path:string, options?:OpenOptions, callback?:FileCallback):void;
   function open(path:string, callback?:FileCallback):void;

   /**
    * Reads from the fd, which is presumed to be an open .zip file. Note that
    * random access is required by the zip file specification, so the fd cannot
    * be an open socket or any other fd that does not support random access.
    */
   function fromFd(file:any, options?:OpenOptions, callback?:FileCallback):void;
   function fromFd(file:any, callback?:FileCallback):void;
   
   /**
    * Returns `null` or a `String` error message depending on the validity of
    * `fileName`. If `fileName` starts with `"/"` or `/[A-Za-z]:\//` or if it
    * contains `".."` path segments or `"\\"`, this function returns an error
    * message.
    */
   function validateFileName(fileName:string):string
}