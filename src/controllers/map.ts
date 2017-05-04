import { Blog, Post, Provider, MapSource } from '../types/';
import is from '../is';
import log from '../logger';
import fetch, { Response } from 'node-fetch';
import config from '../config';
import kml from '../map/kml';
import geoJSON from '../map/geojson';
import template from '../template';
import library from '../library';
import factory from '../factory/';
import realGoogle from '../providers/google';
import * as compress from 'zlib';
import { route as ph, mimeType, httpStatus, header, encoding } from '../constants';
// can be replaced with injection
let google = realGoogle;

/**
 * Map screen loads then makes AJAX call to fetch data
 */
function view(post:Post, req:Blog.Request, res:Blog.Response) {
   if (is.value(post)) {
      const key = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[ph.PHOTO_ID];

      res.render(template.page.MAP, {
         layout: template.layout.NONE,
         title: 'Map',
         post,
         key,
         photoID: is.numeric(photoID) ? photoID : 0,
         config
      });
   } else {
      res.notFound();
   }
}

function post(req:Blog.Request, res:Blog.Response) {
   view(library.postWithKey(req.params[ph.POST_KEY]), req, res);
}

function series(req:Blog.Request, res:Blog.Response) {
   view(library.postWithKey(req.params[ph.SERIES_KEY], req.params[ph.PART_KEY]), req, res);
}

/**
 * https://www.mapbox.com/mapbox-gl-js/example/cluster/
 */
function blog(req:Blog.Request, res:Blog.Response) {
   res.render(template.page.MAPBOX, {
      layout: template.layout.NONE,
      title: config.site.title + ' Map',
      config
   });
}

/**
 * Compressed GeoJSON of all post photos
 */
function blogJSON(req:Blog.Request, res:Blog.Response) {
   factory.map.forBlog()
      .then(item => { res.sendCompressed(mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Compressed GeoJSON of photos and tracks for single post as zipped byte array
 */
function postJSON(req:Blog.Request, res:Blog.Response) {
   factory.map.forPost(req.params[ph.POST_KEY])
      .then(item => { res.sendCompressed(mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Retrieve and parse a map source
 */
function source(req:Blog.Request, res:Blog.Response) {
   const key:string = req.params[ph.MAP_SOURCE];

   if (!is.text(key)) { return res.notFound(); }

   const s = config.map.source[key.replace('.json', '')];

   if (!is.value<MapSource>(s)) { return res.notFound(); }

   // for now hardcoded to KMZ
   const parser = fetchKMZ(s.provider);

   fetch(s.url, { headers: { 'User-Agent': 'node.js' }}).then(reply => {
      if (reply.status == httpStatus.OK) {
         parser(reply)
            .then(JSON.stringify)
            .then(geoText => {
               compress.gzip(Buffer.from(geoText), (err:Error, buffer:Buffer) => {
                  if (is.value(err)) {
                     res.internalError(err);
                  } else {
                     res.setHeader(header.content.ENCODING, encoding.GZIP);
                     res.setHeader(header.CACHE_CONTROL, 'max-age=86400, public');    // seconds
                     res.setHeader(header.content.TYPE, mimeType.JSON + ';charset=utf-8');
                     res.setHeader(header.content.DISPOSITION, `attachment; filename=${key}`);
                     res.write(buffer);
                     res.end();
                  }
               });
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
const fetchKMZ = (sourceName:string) => (res:Response) =>
   res.buffer().then(kml.fromKMZ).then(geoJSON.featuresFromKML(sourceName));

/**
 * Initiate GPX download for a post.
 */
function gpx(req:Blog.Request, res:Blog.Response) {
   const post = config.map.allowDownload ? library.postWithKey(req.params[ph.POST_KEY]) : null;

   if (is.value(post)) {
      google.drive.loadGPX(post, res)
         .then(()=> { res.end(); })
         // errors already logged by loadGPX()
         .catch(res.notFound);
   } else {
      res.notFound();
   }
}

export default {
   gpx,
   post,
   series,
   blog,
   json: {
      blog: blogJSON,
      post: postJSON
   },
   source,
   // inject different data providers
   inject: {
      set google(g:Provider.Google) { google = g; }
   }
};