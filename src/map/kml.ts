import is from '../is';
import xml from './xml';
//import * as stream from 'stream';
import { DOMParser as DOM } from 'xmldom';
import index from './';
import log from '../logger';
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
 * Extract properties from description HTML table. This seems to be standard
 * output format from ESRI systems.
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
 * Return KML from KMZ file. Returns the first .kml file found in the archive.
 */
function fromKMZ(data:Buffer):Promise<Document> {
   return new Promise((resolve, reject) => {
      unzip.fromBuffer(data, (err, zipFile) => {
         zipFile.readEntry();
         zipFile.on('entry', (entry:unzip.Entry) => {
            if (/\.kml$/.test(entry.fileName)) {
               zipFile.openReadStream(entry, (err, stream) => {
                  let text = '';
                  stream.on('end', ()=> {
                     resolve(new DOM().parseFromString(text));
                     //zipFile.close();
                  });
                  stream.on('error', (err:Error) => {
                     // log error but continue iterating through entries
                     log.error(err);
                     zipFile.readEntry();
                  });
                  stream.on('data', buffer => {
                     text += Buffer.isBuffer(buffer) ? buffer.toString() : buffer;
                  });
               });
            } else {
               // try the next file
               zipFile.readEntry();
            }
         });
         zipFile.on('end', ()=> {
            reject('No readable KML found in archive');
         });
         zipFile.on('error', (err:Error) => {
            if (!err.message.includes('central directory file header')) {
               reject(err);
            }
         });
      });
   });
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