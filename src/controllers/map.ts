import { Blog, MapSource } from '../types/';
import { Post, photoBlog } from '../models/index';
import { is, MimeType, HttpStatus, Header, Encoding } from '@toba/tools';
import { log } from '@toba/logger';
import fetch, { Response } from 'node-fetch';
import config from '../config';
import kml from '../map/kml';
import geoJSON from '../map/geojson';
import template from '../template';
import { RouteParam } from '../routes';
import * as compress from 'zlib';

/**
 * Map screen loads then makes AJAX call to fetch data.
 */
function view(post: Post, req: Blog.Request, res: Blog.Response) {
   if (is.value(post)) {
      const key = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[RouteParam.PhotoID];
      // ensure photos are loaded to calculate bounds for map zoom
      post.getPhotos().then(() => {
         res.render(template.page.MAPBOX, {
            layout: template.layout.NONE,
            title: post.name() + ' Map',
            description: post.description,
            post,
            key,
            photoID: is.numeric(photoID) ? photoID : 0,
            config
         });
      });
   } else {
      res.notFound();
   }
}

export function post(req: Blog.Request, res: Blog.Response) {
   view(photoBlog.postWithKey(req.params[RouteParam.PostKey]), req, res);
}

export function series(req: Blog.Request, res: Blog.Response) {
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
export function blog(_req: Blog.Request, res: Blog.Response) {
   res.render(template.page.MAPBOX, {
      layout: template.layout.NONE,
      title: config.site.title + ' Map',
      config
   });
}

/**
 * Compressed GeoJSON of all site photos.
 */
export function photoJSON(_req: Blog.Request, res: Blog.Response) {
   factory.map
      .photos()
      .then(item => {
         res.sendCompressed(MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Compressed GeoJSON of track for post.
 */
export function trackJSON(req: Blog.Request, res: Blog.Response) {
   factory.map
      .track(req.params[RouteParam.PostKey])
      .then(item => {
         res.sendCompressed(MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Retrieve and parse a map source
 */
export function source(req: Blog.Request, res: Blog.Response) {
   const key: string = req.params[RouteParam.MapSource];

   if (!is.text(key)) {
      return res.notFound();
   }

   const s = config.map.source[key.replace('.json', '')];

   if (!is.value<MapSource>(s)) {
      return res.notFound();
   }

   // for now hardcoded to KMZ
   const parser = fetchKMZ(s.provider);

   fetch(s.url, { headers: { 'User-Agent': 'node.js' } }).then(reply => {
      if (reply.status == HttpStatus.OK) {
         parser(reply)
            .then(JSON.stringify)
            .then(geoText => {
               compress.gzip(
                  Buffer.from(geoText),
                  (err: Error, buffer: Buffer) => {
                     if (is.value(err)) {
                        res.internalError(err);
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
               res.internalError(err);
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
function gpx(req: Blog.Request, res: Blog.Response) {
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
         .catch(res.notFound);
   } else {
      res.notFound();
   }
}
