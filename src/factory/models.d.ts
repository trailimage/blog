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
   ensureLoaded():void;
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
   outlierDate?:boolean;
   //get tagList():string;
   //getExif(): Promise<EXIF>;
}

export interface Post {
   id:string;
   key:string;
   title:string;
   subTitle:string;
   description:string;
   longDescription:string;
   seriesKey?:string;
   partKey?:string;
   happenedOn:Date;
   createdOn:Date;
   updatedOn:Date;
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
   feature:boolean;
   /** Category titles mapped to category keys */
   categories:{[key:string]:string};
   hasCategories:boolean;
   infoLoaded:boolean;
   triedTrack:boolean;
   hasTrack:boolean;
   next?:Post;
   previous?:Post;
   /** Position of this post in a series */
   part:number;
   isPartial:boolean;
   nextIsPart:boolean;
   previousIsPart:boolean;
   totalParts:number;
   isSeriesStart:boolean;
   video:VideoInfo;
   makeSeriesStart():void;
   ungroup():void;
   empty():void;
   name():string;
   getInfo():Promise<Post>;
   getPhotos():Promise<Photo[]>;
   hasKey(key:string):boolean;
   hasPhotoID(id:string):boolean;
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