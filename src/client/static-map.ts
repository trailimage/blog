/// <reference types="jquery" />

/**
 * Generated URLs of all photo coordinates get quite long so create them
 * dynamically from element data.
 *
 * Expects img elements with class `static-map` and `data-locations` and
 * `data-href` attributes.
 */
$(function() {
   /** Must be fully qualified path for use with Mapbox */
   const pin = 'https://www.trailimage.com/p.png';

   $('.static-map').each((_i, el) => {
      const $img = $(el);
      // jQuery automatically decodes data
      const locations: number[][] = $img.data('locations');
      const url: string = $img.data('href');

      if (locations && url && locations.length > 0) {
         const pins = locations.map(
            l => 'url-' + encodeURIComponent(`${pin}(${l[0]},${l[1]})`)
         );
         $img.attr('src', url.replace('-pins-', pins.join(',')));
      }
   });
});
