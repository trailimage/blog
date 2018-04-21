import { log } from '@toba/logger';
import { geoJSON, kml } from '@toba/map';
import { Encoding, Header, HttpStatus, MimeType, is } from '@toba/tools';
import { Post, blog } from '@trailimage/models';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import * as compress from 'zlib';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

/**
 * Map screen loads then makes AJAX call to fetch data.
 */
async function render(post: Post, req: Request, res: Response) {
   if (!is.value(post)) {
      view.notFound(req, res);
      return;
   }

   const key = post.isPartial ? post.seriesKey : post.key;
   const photoID = req.params[RouteParam.PhotoID];
   // ensure photos are loaded to calculate bounds for map zoom
   await post.getPhotos();

   res.render(Page.Mapbox, {
      layout: Layout.None,
      title: post.name() + ' Map',
      description: post.description,
      post,
      key,
      photoID: is.numeric(photoID) ? photoID : 0,
      config
   });
}

function post(req: Request, res: Response) {
   render(blog.postWithKey(req.params[RouteParam.PostKey]), req, res);
}

function series(req: Request, res: Response) {
   render(
      blog.postWithKey(
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
function blogJSON(_req: Request, res: Response) {
   res.render(Page.Mapbox, {
      layout: Layout.None,
      title: config.site.title + ' Map',
      config
   });
}

/**
 * Compressed GeoJSON of all site photos.
 */
function photoJSON(req: Request, res: Response) {
   blog.map
      .photos()
      .then(item => {
         view.sendCompressed(res, MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         view.notFound(req, res);
      });
}

/**
 * Compressed GeoJSON of track for post.
 */
function trackJSON(req: Request, res: Response) {
   factory.map
      .track(req.params[RouteParam.PostKey])
      .then(item => {
         view.sendCompressed(res, MimeType.JSON, item);
      })
      .catch(err => {
         log.error(err);
         view.notFound(req, res);
      });
}

/**
 * Retrieve and parse a map source
 */
async function source(req: Request, res: Response) {
   const key: string = req.params[RouteParam.MapSource];

   if (!is.text(key)) {
      return view.notFound(req, res);
   }

   const s = config.map.source[key.replace('.json', '')];

   if (!is.value<MapSource>(s)) {
      return view.notFound(req, res);
   }

   // for now hardcoded to KMZ
   const parser = fetchKMZ(s.provider);

   const reply = await fetch(s.url, {
      headers: { [Header.UserAgent]: 'node.js' }
   });

      if (reply.status == HttpStatus.OK) {
         parser(reply)
            .then(JSON.stringify)
            .then(geoText => {
               compress.gzip(
                  Buffer.from(geoText),
                  (err: Error, buffer: Buffer) => {
                     if (is.value(err)) {
                        view.internalError(res, err);
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
            .catch((err: Error) => {
               view.internalError(res, err);
            });
      } else {
         res.end(reply.status);
      }
   })
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
      ? blog.postWithKey(req.params[RouteParam.PostKey])
      : null;

   if (is.value(post)) {
      google.drive
         .loadGPX(post, res)
         .then(() => {
            res.end();
         })
         // errors already logged by loadGPX()
         .catch(() => view.notFound(req, res));
   } else {
      view.notFound(req, res);
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
