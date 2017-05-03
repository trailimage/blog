import is from '../is';
import xml from './xml';
import * as stream from 'stream';
import { DOMParser as DOM } from 'xmldom';
import index from './';
import * as unzip from 'yauzl';

/**
 * Return location as [latitude, longitude, elevation]
 */
function location(node:Element):number[] {
   const location = new Array(3);
   const point = xml.firstNode(node, 'Point');

   if (point != null) {
      const coordinates = xml.firstValue(point, 'coordinates');
      if (coordinates != null) {
         const parts = coordinates.split(',').map(parseFloat);
         location[index.LON] = parts[0];
         location[index.LAT] = parts[1];
         location[index.ELEVATION] = parts[2];
      }
   }
   return location;
}

/**
 * Extract properties from description HTML table.
 */
function parseDescription(properties:{[key:string]:string}):{[key:string]:string} {
   if (/^<html/.test(properties.description)) {
      let html = null;
      try {
         html = new DOM().parseFromString(properties.description);
      } catch (ex) {
         return properties;
      }

      const tables = html.getElementsByTagName('table');
      let most = 0;
      let index = -1;

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
            const r = rows[i];
            properties[xml.value(r.firstChild)] = xml.value(r.lastChild);
         }
         delete properties['description'];
      }
   }
   return properties;
}

/**
 * Return KML content from KMZ file
 */
function fromKMZ(stream:stream.Readable):string {
   stream.pipe(unzip.Parse());

   return '';
}

/**
 * Properties of a KML node
 */
function properties(node:Element, extras:string[] = []):{[key:string]:string} {
   const names = extras.concat(['name', 'description']); // styleUrl,
   const properties:{[key:string]:string} = {};

   for (const key of names) {
      const value = xml.firstValue(node, key);
      if (!is.empty(value)) { properties[key] = value; }
   }
   return parseDescription(properties);
}

export default { properties, location, fromKMZ };