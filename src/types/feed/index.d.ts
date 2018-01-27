/**
 * https://github.com/jpmonette/feed
 *
 * TypeScript merges modules and classes that have the same name.
 */
declare class Feed {
   constructor(options: Feed.Options);
   addItem(item: Feed.Item): void;
   addCategory(category: string): void;
   addContributor(contributor: Feed.Contributor): void;
   rss2(): void;
   atom1(): void;
   ISODateString(d: Date): string;
}

declare namespace Feed {
   interface Person {
      name: string;
      email?: string;
      link?: string;
   }

   interface Author extends Person {}
   interface Contributor extends Person {}

   interface Item {
      id?: string;
      link: string;
      title: string;
      /** URL */
      image: string;
      description?: string;
      content?: string;
      date: Date;
      copyright?: string;
      pubished?: Date;
      author?: Author | Author[];
      contributor?: Contributor | Contributor[];
   }

   interface Options {
      id?: string;
      title: string;
      description?: string;
      updated?: Date;
      author?: Author;
      /** URL */
      feed?: string;
      /** URL */
      image?: string;
      link?: string;
      hub?: string;
      copyright?: string;
   }
}

declare module 'feed' {
   export = Feed;
}
