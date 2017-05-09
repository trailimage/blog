import map from './map';
import api from './api';
import { getItem, add } from './redis';
import memory from './memory';

export default {
   /** Flickr API JSON responses */
   api,
   /** GeoJSON converted from GPX stored on Google Drive */
   map,
   /** Rendered HBS template pages */
   view: memory,

   getItem,
   add
};