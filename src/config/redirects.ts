/** Maintain redirects to support previously used URLs */
export const redirects: { [key: string]: string } = {
   'brother-rider-2013-a-night-in-pierce': 'brother-ride-2013',
   'backroads-to-college': 'panhandle-past-and-future',
   'owyhee-snow-and-sands-uplands': 'owyhee-snow-and-sand',
   'lunch-at-trinity-lookout': 'trinity-lookout-lunch'
};

/**
 * Support for renamed photo tags. The key is the old name and value is the
 * new name.
 */
export const photoTagChanges: { [key: string]: string } = {
   jeremy: 'jeremyabbott',
   jessica: 'jessicaabbott',
   jime: 'jimeldredge'
};
