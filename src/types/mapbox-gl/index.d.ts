/// <reference types="geojson" />

import * as Mapbox from 'mapbox-gl'

/**
 * Members missing from the existing definition
 *
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/354cec620daccfa0ad167ba046651fb5fef69e8a/types/mapbox-gl/index.d.ts
 * https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html
 */
declare module 'mapbox-gl' {
   export interface Evented {
      on(type:string, layer:string, listener:Function):this;
   }

   export interface MapMouseEvent {
      /**
       * GeoJSON layer click includes features
       */
      features:GeoJSON.Feature<any>[];
   }

   export interface EventData {
      /**
       * Reason for the event. Not part of the Mapbox itself but added in local
       * handling.
       */
      reason:string;
   }

   export interface Point {
      x:number;
      y:number;
   }

   export interface PointCluster {
      point_count:number;
   }
}