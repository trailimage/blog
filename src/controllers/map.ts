//import { log } from '@toba/logger';
import { geoJSON, kml, MapSource } from '@toba/map';
import {
   Encoding,
   Header,
   HttpStatus,
   MimeType,
   is,
   addCharSet
} from '@toba/tools';
import { Post, blog } from '@trailimage/models';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import * as compress from 'zlib';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

const mapPath = 'map';
const gpxPath = 'gpx';

/**
 * Render map screen for a post. Add photo ID to template context if given so
 * it can be highlighted.
 *
 * Map data are loaded asynchronously when the page is ready.
 */
async function render(post: Post, req: Request, res: Response): Promise<void> {
   if (!is.value(post)) {
      return view.notFound(req, res);
   }

   const key: string = post.isPartial ? post.seriesKey : post.key;
   const photoID: string = req.params[RouteParam.PhotoID];
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

/**
 * Render map for a single post.
 */
function post(req: Request, res: Response) {
   render(blog.postWithKey(req.params[RouteParam.PostKey]), req, res);
}

/**
 * Render map for posts in a series.
 */
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
 * @see https://www.mapbox.com/mapbox-gl-js/example/cluster/
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
async function photoJSON(_req: Request, res: Response) {
   view.sendJSON(res, mapPath, async () => await blog.geoJSON());
}

/**
 * Compressed GeoJSON of post photos and possible track.
 */
async function trackJSON(req: Request, res: Response) {
   const slug = req.params[RouteParam.PostKey];
   const post = blog.postWithKey(slug);

   if (is.value(post)) {
      view.sendJSON(
         res,
         `${slug}/${mapPath}`,
         async () => await post.geoJSON()
      );
   } else {
      view.notFound(req, res);
   }
}

/**
 * Retrieve, parse and display a map source.
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

   if (reply.status !== HttpStatus.OK) {
      res.end(reply.status);
      return;
   }

   parser(reply)
      .then(JSON.stringify)
      .then(geoText => {
         compress.gzip(Buffer.from(geoText), (err: Error, buffer: Buffer) => {
            if (is.value(err)) {
               view.internalError(res, err);
            } else {
               res.setHeader(Header.Content.Encoding, Encoding.GZip);
               res.setHeader(Header.CacheControl, 'max-age=86400, public'); // seconds
               res.setHeader(Header.Content.Type, addCharSet(MimeType.JSON));
               res.setHeader(
                  Header.Content.Disposition,
                  `attachment; filename=${key}`
               );
               res.write(buffer);
               res.end();
            }
         });
      })
      .catch((err: Error) => {
         view.internalError(res, err);
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
async function gpx(req: Request, res: Response) {
   const post = config.map.allowDownload
      ? blog.postWithKey(req.params[RouteParam.PostKey])
      : null;

   if (is.value(post)) {
      const geo = await post.geoJSON();
      //view.sendJSON(res, 'some key',
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
      post: trackJSON,
      blog: blogJSON
   }
};
