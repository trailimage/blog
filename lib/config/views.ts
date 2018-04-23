import { sizes } from './post-provider';

export const keywords = [
   'BMW R1200GS',
   'KTM XCW',
   'jeep wrangler',
   'motorcycle',
   'motorcycling',
   'riding',
   'adventure',
   'Jason Abbott',
   'Abbott',
   'outdoors',
   'scenery',
   'idaho',
   'mountains'
];

export const style = {
   icon: {
      /**
       * Match post categories to Material icons.
       *
       * @see https://material.io/icons/
       */
      category: {
         Who: 'person',
         What: 'directions',
         When: 'date_range',
         Where: 'map',
         default: 'local_offer' // tag icon
      } as { [key: string]: string },

      /**
       * Assign mode of transportation icon based on pattern match to
       * `What` category.
       */
      post: {
         motorcycle: /(KTM|BMW|Honda)/gi,
         bicycle: /bicycle/gi,
         hike: /hike/gi,
         jeep: /jeep/gi
      } as { [key: string]: RegExp },

      /** Default transportation mode if none given */
      postDefault: 'motorcycle'
   },
   photoSizes: sizes,
   map: {
      /** Maximum pixel height of static maps displayed with post summaries */
      maxInlineHeight: 200
   },
   css: {
      /** See category-page.less */
      categoryHeader: 'category-header'
   },
   /** Characters used between displayed title and subtitle */
   subtitleSeparator: ':'
};
