export interface EXIF {
   artist: string,
   compensation: string,
   time: number,
   fNumber: number,
   focalLength: number,
   ISO: number,
   lens: string,
   model: string,
   software: string,
   sanitized: boolean
}

/**
 * Singleton collection of photos grouped into "posts" (called a "set" or
 * "album" in most providers) that are in turn assigned categories. Additional
 * library methods are added by the factory.
 */
export interface Library {
   categories:{ [key: string]: Category };
   posts:Post[];
   tags:{ [key: string]: string };
   loaded:boolean;
   postInfoLoaded:boolean;
   changedKeys:string[];
   /** All photos in all posts */
   getPhotos():Promise<Photo[]>;
   getEXIF(photoID:number):Promise<EXIF>;
   addPost(p:Post):void;
   categoryKeys(filterList?:string[]):string[];
   categoryWithKey(key:string):Category;
   postKeys():string[];
   postWithID(id:string):Post;
   postWithKey(key:string, partKey?:string):Post;
   empty():void;
   getPostWithPhoto(photo:Photo|string):Promise<Post>;
   getPhotosWithTags(tags:string|string[]):Promise<Photo[]>;
   photoTagList(photos:Photo[]):string;
   load(emptyIfLoaded:boolean):Promise<Library>;
   unload(keys:string|string[]):void;
}

export interface Category {
   title:string;
   key:string;
   has(key:string):boolean;
   subcategories:Category[];
   posts:Post[];
   readonly isChild:boolean;
   readonly isParent:boolean;
   ensureLoaded():Promise<null>;
   //unload(keys:string|string[]):void;
   add(subcategory:Category):void;
   getSubcategory(key:string):Category;
   removePost(post:Post):Category;
}

export interface Photo {
   id:string;
   index?:number;
   sourceUrl?:string;
   title?:string;
   description?:string;
   tags?:string[];
   dateTaken?:Date;
   latitude?:number;
   longitude?:number;
   primary?:boolean;
   size:{ [key: string]: Size };
   preview?:Size;
   normal?:Size;
   big?:Size;
   /** Whether photo is an outlier compared to the others */
   outlierDate?:boolean;
   tagList?:string;
   //getExif(): Promise<EXIF>;
}

export interface Post {
   id:string;
   key:string;
   title:string;
   subTitle:string;
   description:string;
   longDescription:string;
   happenedOn:Date;
   createdOn:Date;
   updatedOn:Date;
   /**
    * Whether post pictures occurred at a specific point in time (exceptions
    * are themed sets) 
    */
   chronological:boolean;
   originalTitle:string;
   photosLoaded:boolean;
   bigThumbURL:string;
   smallThumbURL:string;
   photos:Photo[];
   photoCount:number;
   photoTagList:string,
   photoMarkers:string,
   coverPhoto:Photo;
   /** Whether posts is featured in main navigation */
   feature:boolean;
   /** Category titles mapped to category keys */
   categories:{[key:string]:string};
   hasCategories:boolean;
   infoLoaded:boolean;
   /** Whether attempt was made to load GPX track */
   triedTrack:boolean;
   /** Whether GPX track was found for the post */
   hasTrack:boolean;
   next?:Post;
   previous?:Post;
   /** Position of this post in a series */
   part:number;
   /** Whether post is part of a series */
   isPartial:boolean;
   /** Whether next post is part of the same series */
   nextIsPart:boolean;
   /** Whether previous post is part of the same series */
   previousIsPart:boolean;
   /** Total number of posts in the series */
   totalParts:number;
   /** Whether this post is the first in a series */
   isSeriesStart:boolean;
   seriesKey?:string;
   partKey?:string;
   video:VideoInfo;
   makeSeriesStart():void;
   ungroup():void;
   empty():void;
   name():string;
   getInfo():Promise<Post>;
   getPhotos():Promise<Photo[]>;
   hasKey(key:string):boolean;
   //hasPhotoID(id:string):boolean;
   ensureLoaded():Promise<null>;
   updatePhotoMarkers():void;
}

export interface VideoInfo {
   id:string;
   width:number;
   height:number;
   empty:boolean
}

export interface Size {
   url: string,
   width: number,
   height: number,
   isEmpty?: boolean
}