/// <reference types="jquery" />
/// <reference types="google.analytics" />
/// <reference path="../types/mapbox-gl/index.d.ts" />
/// <reference path="../types/jquery/index.d.ts"/>

const util = {
   setting: {
      /**
       * Save setting to browser storage.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage
       */
      save(key: string, value: string): void {
         if (!window.localStorage) {
            return;
         }
         localStorage.setItem(key, value);
      },

      /**
       * Load setting from browser storage.
       */
      load(key: string): string | null {
         if (!window.localStorage) {
            return null;
         }
         return localStorage.getItem(key);
      },

      set showMapLegend(value: boolean) {
         util.setting.save('map-legend', value ? 'true' : 'false');
      },

      get showMapLegend(): boolean {
         const value = util.setting.load('map-legend');
         return value ? value == 'true' : true;
      },

      /**
       * Value is array of root and sub-category names.
       */
      set menuCategory(selected: (string | null)[] | null) {
         if (typeof selected === 'string') {
            selected = [selected, null];
         }
         if (selected !== null) {
            util.setting.save('menu', selected.join());
         }
      },

      get menuCategory(): (string | null)[] | null {
         const value = util.setting.load('menu');
         return value === null ? null : value[1].split(',');
      }
   },
   html: {
      /**
       * Generate Google material icon HTML with optional click handler.
       *
       * @see https://material.io/icons/
       */
      icon(name: string, handler?: (e: JQuery.Event) => void): JQuery {
         const $icon = $('<i>')
            .addClass('material-icons ' + name)
            .text(name);

         if (handler !== undefined) {
            $icon.click(handler);
         }
         return $icon;
      }
   },
   log: {
      /**
       * Send Google Analytics event.
       */
      event(category: string, name: string, label?: string) {
         ga('send', 'event', category, name, label);
      }
   }
};
