/**
 * https://github.com/jpmonette/feed
 */
declare module "feed" {
   interface Person {
      name:string;
      email?:string;
      link?:string;
   }

   interface Author extends Person {}
   interface Contributor extends Person {}

   interface Item {
      id:string;
      link:string;
      title:string;
      description?:string;
      content?:string;
      date:Date;
      copyright?:string;
      pubished?:Date;
      author?:Author|Author[];
      contributor?:Contributor|Contributor[];
   }

   interface Options {
      id:string;
      title:string;
      description?:string;
      updated?:Date;
      author?:Author;
      /** URL */
      feed?:string;
      /** URL */
      image?:string;
      link?:string;
      hub?:string;
      copyright?:string;
   }

   export interface Feed {
      new(options:Options):Feed;
      addItem(item:Item):void;
      addCategory(category:string):void;
      addContributor(contributor:Contributor):void;
      rss2():void;
      atom1():void;
      ISODateString(d:Date):string;
   }
}