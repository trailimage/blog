/// <reference types="jquery" />
/// <reference types="google.analytics" />
/// <reference path="../types/mapbox-gl/index.d.ts" />
/// <reference path="../types/jquery/index.d.ts"/>

const util = {
   setting: {
      /**
       * Save setting to browser storage.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage
       */
      save(key:string, value:string):void {
         if (!window.localStorage) { return; }
         localStorage.setItem(key, value);
      },

      /**
       * Load setting from browser storage.
       */
      load(key:string):string {
         if (!window.localStorage) { return null; }
         return localStorage.getItem(key);
      },

      set showMapLegend(value:boolean) {
          util.setting.save('map-legend', value ? 'true' : 'false');
      },

      get showMapLegend():boolean {
         const value = util.setting.load('map-legend');
         return value ? value == 'true' : true;
      },

      set menuCategory(selected:string[]) {
         if (typeof selected === 'string') { selected = [selected, null]; }
         util.setting.save('menu', selected.join());
      },

      get menuCategory():string[] {
         const value = util.setting.load('menu');
         return (value === null) ? null : value[1].split(',');
      }
   },
   html: {
      /**
       * Generate Google material icon HTML with optional click handler.
       *
       * https://material.io/icons/
       */
      icon(name:string, handler?:(e:JQueryMouseEventObject)=>void):JQuery {
         const $icon = $('<i>')
            .addClass('material-icons ' + name)
            .text(name);

         if (handler !== undefined) { $icon.click(handler); }
         return $icon;
      }
   },
   log: {
      /**
       * Send Google Analytics event.
       */
      event(category:string, name:string, label?:string) {
         ga('send', 'event', category, name, label);
      }
   }
};