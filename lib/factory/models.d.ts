export interface EXIF {
   artist: string,
   compensation: number,
   time: number,
   fNumber: number,
   focalLength: number,
   ISO: number,
   lens: string,
   model: string,
   software: string,
   sanitized: boolean
}

export interface Library {
   categories: { [key: string]: Category };
   posts: Post[];
   tags: { [key: string]: string };
   loaded: boolean;
   postInfoLoaded: boolean;
   postWithKey(key:string):Post;
   empty(): Library;
}

export interface Category {
   title: string;
   key: string;
   subcategories: Category[];
   posts: Post[];
   isChild: boolean;
   isParent: boolean;
   unload(keys:string|string[]):void;
   add(subcategory: Category): void;
   getSubcategory(key: string): Category;
   removePost(post: Post): Category;
}

export interface Photo {
   id: string,
   index: number,
   sourceUrl: string,
   title: string,
   description: string,
   tags: string[],
   dateTaken: Date,
   latitude: number,
   longitude: number,
   primary: boolean,
   size: { [key: string]: Size },
   preview: Size,
   normal: Size,
   big: Size,
   getExif(): Promise<EXIF>
}

export interface Post {
   id: string,
   key: string,
   seriesKey: string,
   partKey: string,
   chronological: boolean,
   originalTitle: string,
   photosLoaded: boolean,
   photos: Photo[],
   photoCount: number,
   coverPhoto: Photo,
   feature: boolean,
   categories:{[key:string]:Category},
   hasCategories: boolean,
   infoLoaded: boolean,
   triedTrack: boolean,
   hasTrack: boolean,
   next?: Post,
   previous?: Post,
   part: number,
   isPartial: boolean,
   nextIsPart: boolean,
   previousIsPart: boolean,
   totalParts: number,
   isSeriesStart: boolean,
   photoCoordinates: string,
   makeSeriesStart(): Post,
   ungroup(): Post,
   empty(): Post,
   name(): string,
   getInfo(): Promise<Post>,
   getPhotos(): Promise<Photo[]>,
   hasKey(key: string): boolean,
   hasPhotoID(id: string): boolean,
   serializePhotoCoordinates(): Post
}

export interface Size {
   url: string,
   width: number,
   height: number,
   isEmpty: boolean
}