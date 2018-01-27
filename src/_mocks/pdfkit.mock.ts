export default {
   title: null,
   author: null,
   /**
    * Registered fonts
    */
   fonts: {} as { [key: string]: string },
   x: 0,
   y: 0,
   _font: null as string,
   _fontSize: 0,
   _fillColor: [] as number[],

   registerFont(name: string, path: string, _family?: string) {
      this.fonts[name] = path;
   },

   addPage(_options: any): void {
      return;
   },

   font(f: string) {
      this._font = f;
   },

   fontSize(s: number) {
      this._fontSize = s;
   }
};
