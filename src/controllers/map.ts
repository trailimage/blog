import { Post, photoBlog } from '../models/index';
import { is, MimeType, HttpStatus, Header, Encoding } from '@toba/tools';
import { log } from '@toba/logger';
import fetch from 'node-fetch';
import config from '../config';
import kml from '../map/kml';
import geoJSON from '../map/geojson';
import { Page, Layout } from '../template';
import { RouteParam } from '../routes';
import * as compress from 'zlib';
import { Response, Request } from 'express';
import { notFound, internalError, sendCompressed } from '../response';

/**
 * Map screen loads then makes AJAX call to fetch data.
 */
function view(post: Post, req: Request, res: Response) {
   if (is.value(post)) {
      const key = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[RouteParam.PhotoID];
      // ensure photos are loaded to calculate bounds for map zoom
      post.getPhotos().then(() => {
         res.render(Page.Mapbox, {
            layout: Layout.None,
            title: post.name() + ' Map',
            description: post.description,
            post,
            key,
            photoID: is.numeric(photoID) ? photoID : 0,
            config
         });
      });
   } else {
      notFound(res);
   }
}

export function post(req: Request, res: Response) {
   view(photoBlog.postWithKey(req.params[RouteParam.PostKey]), req, res);
}

export function series(req: Request, res: Response) {
   view(
      photoBlog.postWithKey(
         req.params[RouteParam.SeriesKey],
         req.params[RouteParam.PartKey]
      ),
      req,
      res
   );
}

/**
 * https://www.mapbox.com/mapbox-gl-js/example/cluster/
 */
export function blog(_req: Request, res: Response) {
   res.render(Page.Mapbox, {
      layout: Layout.None,
      title: config.site.title + ' Map',
      config
   });
}

/**
 * Compressed GeoJSON of all site photos.
 */
export function photoJSON(_req: Request, res: Response) {
   photoBlog.map
      .photos()
      .then(item => {
         sendCompressed(res, MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         notFound(res);
      });
}

/**
 * Compressed GeoJSON of track for post.
 */
export function trackJSON(req: Request, res: Response) {
   factory.map
      .track(req.params[RouteParam.PostKey])
      .then(item => {
         sendCompressed(res, MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         notFound(res);
      });
}

/**
 * Retrieve and parse a map source
 */
export function source(req: Request, res: Response) {
   const key: string = req.params[RouteParam.MapSource];

   if (!is.text(key)) {
      return notFound(res);
   }

   const s = config.map.source[key.replace('.json', '')];

   if (!is.value<MapSource>(s)) {
      return notFound(res);
   }

   // for now hardcoded to KMZ
   const parser = fetchKMZ(s.provider);

   fetch(s.url, { headers: { [Header.UserAgent]: 'node.js' } }).then(reply => {
      if (reply.status == HttpStatus.OK) {
         parser(reply)
            .then(JSON.stringify)
            .then(geoText => {
               compress.gzip(
                  Buffer.from(geoText),
                  (err: Error, buffer: Buffer) => {
                     if (is.value(err)) {
                        internalError(res, err);
                     } else {
                        res.setHeader(Header.Content.Encoding, Encoding.GZip);
                        res.setHeader(
                           Header.CacheControl,
                           'max-age=86400, public'
                        ); // seconds
                        res.setHeader(
                           Header.Content.Type,
                           MimeType.JSON + ';charset=utf-8'
                        );
                        res.setHeader(
                           Header.Content.Disposition,
                           `attachment; filename=${key}`
                        );
                        res.write(buffer);
                        res.end();
                     }
                  }
               );
            })
            .catch(err => {
               internalError(res, err);
            });
      } else {
         res.end(reply.status);
      }
   });
}

/**
 * Curried method to capture `sourceName` used in the GeoJSON conversion to
 * load any custom transformations.
 */
const fetchKMZ = (sourceName: string) => (res: Response) =>
   res
      .buffer()
      .then(kml.fromKMZ)
      .then(geoJSON.featuresFromKML(sourceName));

/**
 * Initiate GPX download for a post.
 */
function gpx(req: Request, res: Response) {
   const post = config.map.allowDownload
      ? photoBlog.postWithKey(req.params[RouteParam.PostKey])
      : null;

   if (is.value(post)) {
      google.drive
         .loadGPX(post, res)
         .then(() => {
            res.end();
         })
         // errors already logged by loadGPX()
         .catch(() => notFound(res));
   } else {
      notFound(res);
   }
}

export const map = {
   gpx,
   fetchKMZ,
   post,
   series,
   source,
   blog,
   json: {
      photo: photoJSON,
      track: trackJSON,
      blog: blogJSON
   }
};
