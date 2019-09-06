//import { log } from '@toba/logger';
import { MapSource, loadSource } from '@toba/map';
import {
   Encoding,
   Header,
   MimeType,
   is,
   addCharSet,
   inferMimeType
} from '@toba/node-tools';
import { Post, blog } from '@trailimage/models';
import { Request, Response } from 'express';
import * as compress from 'zlib';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

const mapPath = 'map';

/**
 * Render map screen for a post. Add photo ID to template context if given so
 * it can be highlighted.
 *
 * Map data are loaded asynchronously when the page is ready.
 */
async function render(
   post: Post | undefined,
   req: Request,
   res: Response
): Promise<void> {
   if (!is.value<Post>(post)) {
      return view.notFound(req, res);
   }

   const key: string | undefined = post.isPartial ? post.seriesKey : post.key;
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
 * @see https://www.mapbox.com/mapbox-gl-js/example/cluster/
 */
function blogMap(_req: Request, res: Response) {
   res.render(Page.Mapbox, {
      layout: Layout.None,
      title: config.site.title + ' Map',
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
 * Compressed GeoJSON of all site photos.
 */
function photoJSON(_req: Request, res: Response) {
   view.sendJSON(res, mapPath, blog.geoJSON.bind(blog));
}

/**
 * Compressed GeoJSON of post photos and possible track.
 */
async function trackJSON(req: Request, res: Response) {
   const slug = req.params[RouteParam.PostKey];
   const post = blog.postWithKey(slug);

   if (is.value<Post>(post)) {
      view.sendJSON(res, `${slug}/${mapPath}`, post.geoJSON.bind(post));
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

   const geo = await loadSource(key.replace('.json', ''));

   if (!is.value<MapSource>(geo)) {
      return view.notFound(req, res);
   }

   const geoText = JSON.stringify(geo);

   try {
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
   } catch (err) {
      view.internalError(res, err);
   }
}

/**
 * Initiate GPX download for a post.
 */
function gpx(req: Request, res: Response) {
   const post = config.providers.map.allowDownload
      ? blog.postWithKey(req.params[RouteParam.PostKey])
      : null;

   if (is.value<Post>(post)) {
      const fileName = post.title + '.gpx';
      const mimeType = inferMimeType(fileName);
      res.setHeader(
         Header.Content.Disposition,
         `attachment; filename=${fileName}`
      );
      if (mimeType !== null) {
         res.setHeader(Header.Content.Type, mimeType);
      }
      post.gpx(res).catch(err => {
         console.error(err);
         res.removeHeader(Header.Content.Type);
         res.removeHeader(Header.Content.Disposition);
         view.notFound(req, res);
      });
   } else {
      view.notFound(req, res);
   }
}

export const map = {
   gpx,
   post,
   series,
   source,
   blog: blogMap,
   json: {
      photo: photoJSON,
      post: trackJSON,
      blog: photoJSON
   }
};
