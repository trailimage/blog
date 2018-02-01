import { MapProperties } from '../types/';
import { is } from '@toba/utility';
import xml from './xml';
//import * as stream from 'stream';
import { DOMParser as DOM } from 'xmldom';
import index from './';
import util from '../util/';
import * as JSZip from 'jszip';

/**
 * Coordinate values for one or more segments. In KML these are
 * space-separated, comma-delimited points. Example:
 *
 *    -113.2924677415256,44.70498119901985,0 -113.2924051073907,44.70509329841001,0 -113.2922923580428,44.70527906358436,0
 */
function coordinates(node: Element, name: string): number[][][] {
   const lines = node.getElementsByTagName(name);

   if (lines != null && lines.length > 0) {
      const segments: number[][][] = [];

      for (let i = 0; i < lines.length; i++) {
         const coordinates = xml.firstValue(lines[i], 'coordinates');
         if (coordinates != null) {
            const locations: number[][] = [];
            const points = coordinates.trim().split(' ');

            points.forEach(p => {
               const location: number[] = [];
               const parts = p.split(',').map(roundFromString(6));

               if (parts.length >= 2) {
                  location[index.LON] = parts[0];
                  location[index.LAT] = parts[1];

                  if (parts.length >= 3) {
                     location[index.ELEVATION] = parts[2];
                  }
                  locations.push(location);
               }
            });
            if (locations.length > 0) {
               segments.push(locations);
            }
         }
      }
      if (segments.length > 0) {
         return segments;
      }
   }
   return null;
}

const roundFromString = (places: number) => (n: string) =>
   parseFloat(parseFloat(n).toFixed(places));

/**
 * Return location as `[latitude, longitude, elevation]` or null if the element
 * contains no coordinates.
 */
function location(node: Element): number[] {
   const locations = coordinates(node, 'Point');
   if (locations != null && locations.length > 0) {
      if (locations.length > 1) {
         return locations[0][0];
      } else {
         return locations[0][0];
      }
   }
   return null;
}

/**
 * Get array of segments (which are arrays of point arrays) or null if the
 * element contains no coordinates.
 */
function line(node: Element): number[][][] {
   const l = coordinates(node, 'LineString');
   return l == null || l.length == 0 ? null : l;
}

/**
 * Extract properties from description HTML table. This seems to be standard
 * output format from ESRI systems.
 */
function parseDescription(properties: MapProperties): MapProperties {
   if (/<html/.test(properties.description)) {
      // remove CDATA wrapper
      const source = properties.description
         .replace(/^<\!\[CDATA\[/, '')
         .replace(/\]\]>$/, '');
      let html: Document = null;

      try {
         html = new DOM().parseFromString(source);
      } catch (ex) {
         return properties;
      }

      const tables = html.getElementsByTagName('table');
      const clean = (text: string) =>
         is.value(text)
            ? text
                 .replace(/[\r\n]/g, '')
                 .replace('&lt;Null&gt;', '')
                 .replace('<Null>', '')
            : null;

      let most = 0;
      let index = -1;

      // find index of the largest table
      for (let i = 0; i < tables.length; i++) {
         const t = tables[i];
         if (t.childNodes.length > most) {
            most = t.childNodes.length;
            index = i;
         }
      }

      if (index > 0) {
         const rows = tables[index].getElementsByTagName('tr');
         for (let i = 0; i < rows.length; i++) {
            const cols = rows[i].getElementsByTagName('td');
            const key = clean(xml.value(cols[0]));
            const value = util.number.maybe(clean(xml.value(cols[1])));

            if (key && value) {
               properties[key.replace(' ', '_')] = value;
            }
         }
         delete properties['description'];
      }
   }
   return properties;
}

/**
 * Return KML from KMZ file. Returns the first .kml file found in the archive
 * which should be doc.kml.
 */
function fromKMZ(data: Buffer): Promise<Document> {
   return new Promise((resolve, reject) => {
      const zip = new JSZip();
      zip.loadAsync(data).then(archive => {
         for (const name in archive.files) {
            if (name.endsWith('.kml')) {
               archive.files[name].async('text').then((text: string) => {
                  try {
                     resolve(new DOM().parseFromString(text));
                  } catch (ex) {
                     reject(ex);
                  }
               });
               return;
            }
         }
         reject('No readable KML found in archive');
      });
   });
}

/**
 * Properties of a KML node.
 */
function properties(node: Element, extras: string[] = []): MapProperties {
   const names = extras.concat(['name', 'description']);
   const properties: MapProperties = {};

   for (const key of names) {
      let value = xml.firstValue(node, key);
      if (!is.empty(value)) {
         switch (key) {
            case 'name':
               value = util.titleCase(value);
               break;
            //case 'description': value = value.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' '); break;
         }
         properties[key] = util.number.maybe(value);
      }
   }
   delete properties['description'];

   return parseDescription(properties);
}

export default { properties, location, line, fromKMZ, parseDescription };
