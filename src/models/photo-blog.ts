import { Post, Category, Photo, EXIF } from './index';

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * library methods are added by the factory.
 */
class PhotoBlog {
   categories: { [key: string]: Category } = {};
   posts: Post[] = [];
   tags: { [key: string]: string } = {};
   loaded: boolean = false;
   postInfoLoaded: boolean = false;
   changedKeys: string[];

   /** All photos in all posts */
   // getPhotos(): Promise<Photo[]>;
   getEXIF: (photoID: number) => Promise<EXIF>;
   // addPost(p: Post): void;
   // categoryKeys(filterList?: string[]): string[];
   // categoryWithKey(key: string): Category;
   // postKeys(): string[];
   // postWithID(id: string): Post;
   // postWithKey(key: string, partKey?: string): Post;

   postKeys(): string[] {
      return this.posts.map(p => p.key);
   }

   empty(): PhotoBlog {
      this.categories = {};
      this.posts = [];
      this.tags = {};
      this.loaded = false;
      this.postInfoLoaded = false;
      return this;
   }

   getPostWithPhoto: (photo: Photo | string) => Promise<Post>;
   getPhotosWithTags: (tags: string | string[]) => Promise<Photo[]>;
   // photoTagList(photos: Photo[]): string;
   // load(emptyIfLoaded: boolean): Promise<Library>;
   // unload(keys: string | string[]): void;

   /**
    * Match posts that are part of a series
    */
   correlatePosts() {
      let p = this.posts[0];
      let parts = [];

      while (p != null && p.previous != null) {
         if (p.subTitle !== null) {
            parts.push(p);

            while (p.previous != null && p.previous.title == p.title) {
               p = p.previous;
               parts.unshift(p);
            }

            if (parts.length > 1) {
               parts[0].makeSeriesStart();

               for (let i = 0; i < parts.length; i++) {
                  parts[i].part = i + 1;
                  parts[i].totalParts = parts.length;
                  parts[i].isPartial = true;

                  if (i > 0) {
                     parts[i].previousIsPart = true;
                  }
                  if (i < parts.length - 1) {
                     parts[i].nextIsPart = true;
                  }
               }
            } else {
               p.ungroup();
            }
            parts = [];
         }
         p = p.previous;
      }
   }
}

/**
 * `PhotoBlog` singleton
 */
export const photoBlog = new PhotoBlog();
