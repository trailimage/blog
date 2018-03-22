export class VideoInfo {
   id: string = null;
   width: number = 0;
   height: number = 0;

   constructor(id: string, width: number, height: number) {
      this.id = id;
      this.width = width;
      this.height = height;
   }

   get empty() {
      return this.width === 0 || this.height === 0;
   }
}
