export namespace Cache {
   export interface Item {
      buffer:Buffer;
      eTag:string;
   }

   export interface Provider {
      getItem(key:string, hashKey?:string):Promise<Item>;
      keys():Promise<string[]>;
      add(key:string, value:any):Promise<Item>;
      create(key:string, htmlOrJSON:string|GeoJSON.FeatureCollection<any>):Promise<Cache.Item>;
      exists(key:string):Promise<boolean>;
      addIfMissing(key:string, buffer:Buffer|string):Promise<any>;
      remove(keys:string|string[]):Promise<any>;
      serialize(item:Item):string|Item;
   }
}