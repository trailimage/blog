import { is, titleCase } from '@toba/node-tools';
import { MapSource, MapProperties, relabel } from '@toba/map';

const vehicle: { [key: string]: string } = {
   ATV: 'ATV',
   AUTOMOBILE: 'Automobile',
   JEEP: 'Jeep',
   MOTORCYCLE: 'Motorcycle',
   UTV: 'UTV'
};

/**
 * Update seasonal restriction field.
 */
function seasonal(
   vehicleKey: string,
   from: MapProperties,
   out: MapProperties
): void {
   if (is.defined(from, vehicleKey)) {
      out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
   }
}

function trails(from: MapProperties): MapProperties {
   const out: MapProperties = { description: '' };
   const miles: number = from['MILES'] as number;
   const who = 'Jurisdiction';
   let name: string = from['NAME'] as string;
   let label: string = from['name'] as string;

   if (miles && miles > 0) {
      out['Miles'] = miles;
   }
   if (is.value<string>(label)) {
      label = label.trim();
   }

   if (!is.empty(name) && !is.empty(label)) {
      name = titleCase(name.trim());
      // label is usually just a number so prefer name when supplied
      const num = label.replace(/\D/g, '');
      // some names alread include the road or trail number and
      // some have long numbers that aren't helpful
      label =
         (num.length > 1 && name.includes(num)) || num.length > 3
            ? name
            : name + ' ' + label;
   }

   if (label) {
      out['Label'] = label;
   }

   Object.keys(vehicle).forEach(key => {
      seasonal(key, from, out);
   });

   relabel(from, out, { JURISDICTION: who });

   if (is.defined(out, who)) {
      out[who] = titleCase(out[who] as string);
   }

   return out;
}

/**
 * Normalize mining field names.
 */
function mines(from: MapProperties): MapProperties {
   const out: MapProperties = { description: '' };
   // lowercase "name" is the county name
   relabel(from, out, {
      FSAgencyName: 'Forest Service Agency',
      LandOwner: 'Land Owner',
      DEPOSIT: 'Name',
      Mining_District: 'Mining District'
   });
   return out;
}

export const mapSource: { [key: string]: MapSource } = {
   mines: {
      name: '',
      provider: 'Idaho Geological Survey',
      transform: mines,
      url:
         'http://www.idahogeology.org/PDF/Digital_Data_(D)/Digital_Databases_(DD)/Mines_Prospects/2016/MinesAndProspects.kmz'
   },
   'hot-springs': {
      name: '',
      provider: 'Idaho Geological Survey',
      url:
         'http://www.idahogeology.org/PDF/Digital_Data_(D)/Digital_Databases_(DD)/Mines_Prospects/2016/MinesAndProspects.kmz'
   },
   atv: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      transform: trails,
      url: 'https://trails.idaho.gov/pages/kmz/ATV.kmz'
   },
   'atv-seasonal': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/ATV_Seasonal.kmz'
   },
   automobile: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Automobile.kmz'
   },
   'automobile-seasonal': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Automobile_Seasonal.kmz'
   },
   highway: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Highway_Legal.kmz'
   },
   'highway-seasonal': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Highway_Legal_Seasonal.kmz'
   },
   jeep: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Jeep.kmz'
   },
   'jeep-seasonal': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Jeep_Seasonal.kmz'
   },
   motorcycle: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Motorcycle.kmz'
   },
   'motorcycle-seasonal': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Motorcycle_Seasonal.kmz'
   },
   'non-motorized': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Nonmotorized.kmz'
   },
   'other-roads': {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Other_Road.kmz'
   },
   wilderness: {
      name: '',
      provider: 'Idaho Parks & Recreation',
      url: 'https://trails.idaho.gov/pages/kmz/Wilderness.kmz'
   },
   'moscow-mountain': {
      name: '',
      provider: 'Moscow Area Mountain Bike Association',
      url:
         'https://drive.google.com/uc?export=download&id=0B0lgcM9JCuSbbDV2UUNILWpUc28'
   }
};
