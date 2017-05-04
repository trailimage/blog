import { MapProperties } from '../types/';
import { titleCase } from '../util/text';
import is from '../is';

/**
 * Travel restriction categories.
 */
const vehicle:{[key:string]:string} = {
   ATV: 'ATV',
   AUTOMOBILE: 'Automobile',
   JEEP: 'Jeep',
   MOTORCYCLE: 'Motorcycle',
   UTV: 'UTV'
};

/**
 * Update seasonal restriction field.
 */
function seasonal(vehicleKey:string, from:MapProperties, out:MapProperties):void {
   if (from[vehicleKey]) {
      out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
   }
}

/**
 * Copy labeled values to new labels.
 */
function relabel(from:MapProperties, out:MapProperties, labels:{[key:string]:string}):void {
   Object.keys(labels).forEach(key => {
      if (from[key]) { out[labels[key]] = from[key]; }
   });
}

/**
 * Custom property transformations per named map source.
 */
export default {
   ['Idaho Parks & Recreation'](from:MapProperties):MapProperties {
      const out:MapProperties = {};
      const miles:number = from['MILES'] as number;
      const who = 'Jurisdiction';
      let name:string = from['NAME'] as string;
      let label:string = from['name'] as string;

      if (miles && miles > 0) { out['Miles'] = miles; }
      if (label) { label = label.toString().trim(); }

      if (!is.empty(name) && !is.empty(label)) {
         name = titleCase(name.toString().trim());
         // label is usually just a number so prefer name when supplied
         const num = label.replace(/\D/g, '');
         // some names alread include the road or trail number and
         // some have long numbers that aren't helpful
         label = ((num.length > 1 && name.includes(num)) || num.length > 3) ? name : name + ' ' + label;
      }

      if (label) { out['Label'] = label; }

      Object.keys(vehicle).forEach(key => { seasonal(key, from, out); });
      relabel(from, out, { JURISDICTION: who });
      if (out[who]) { out[who] = titleCase(out[who] as string); }

      return out;
   },

   ['Idaho Geological Survey'](from:MapProperties):MapProperties {
      const out:MapProperties = {};
      // lowercase "name" is the county name
      relabel(from, out, {
         FSAgencyName: 'Forest Service Agency',
         LandOwner: 'Land Owner',
         Deposit: 'Name',
         Mining_District: 'Mining District'
      });
      return out;
   }
} as {[key:string]:(p:MapProperties) => MapProperties};