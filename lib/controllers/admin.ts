import { Blog } from '../types';
import is from '../is';
import log from '../logger';
import flickr from '../providers/flickr';
import cache from '../cache/';
import config from '../config';
import template from '../template';
import library from '../library';

/**
 * Cache keys for site map and menu views
 */
const menuKeys = [
   template.page.MOBILE_MENU_DATA,
   template.page.POST_MENU_DATA,
   template.page.CATEGORY_MENU,
   template.page.SITEMAP
];

function view(res:Blog.Response, viewKeys:string[], jsonKeys:string[], mapKeys:string[], logs:any) {
   res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0
   });
   res.render(template.page.ADMINISTRATION, {
      logs,
      layout: template.layout.NONE,
      maps: is.array(mapKeys) ? mapKeys.sort() : null,
      views: is.array(viewKeys) ? viewKeys.sort() : null,
      json: is.array(jsonKeys) ? jsonKeys.sort() : null,
      library,
      config
   });
}

/**
 * Load all caches and logs
 */
function home(req:Blog.Request, res:Blog.Response) {
   log.warnIcon('security', '%s viewing administration', req.clientIP());

   Promise.all([
      cache.api.keys(),
      cache.view.keys(),
      cache.map.keys(),
      log.query(7)
   ]).then(([jsonKeys, viewKeys, mapKeys, logs]) => {
      jsonKeys = (is.array(jsonKeys)) ? jsonKeys.map(j => j.replace(cache.prefix, '')) : [];
      view(res, viewKeys, jsonKeys, mapKeys, logs);
   });
}

/**
 * Delete library caches then update from photo provider, usually to find new posts
 */
function updateLibrary(req:Blog.Request, res:Blog.Response) {
   return cache.remove(flickr.cache.keysForLibrary).then(()=> library.load(false)
      .then(()=> {
         if (library.changedKeys.length > 0) {
            let changedKeys = library.changedKeys;
            // always refresh menus
            changedKeys = changedKeys.concat(menuKeys);
            changedKeys.sort();
            // remove cached views affected by the update
            cache.view.remove(changedKeys).then(res.jsonMessage);
         } else {
            res.jsonMessage();
         }
      }))
      .catch(res.jsonError);
}

/**
 * Delete view and API caches for a post
 */
function deleteViewCache(req:Blog.Request, res:Blog.Response) {
   // cache keys to be invalidated
   let viewKeys:string[] = [];
   const apiHashKeys = [];
   const removals = [];
   const includeRelated = req.body['includeRelated'] == 'true';

   for (const key of req.body['selected']) {
      const p = library.postWithKey(key);

      viewKeys.push(key);

      if (is.value(p)) {
         // API calls are keyed to provider's ID
         apiHashKeys.push(p.id);

         if (includeRelated) {
            // include post categories
            viewKeys = viewKeys.concat(Object.keys(p.categories));
            // and adjacent views
            // (no need to invalidate API caches for neighboring posts
            // since correlation is not part of the API)
            if (is.value(p.next)) { viewKeys.push(p.next.key); }
            if (is.value(p.previous)) { viewKeys.push(p.previous.key); }
         }
      }
   }
   if (apiHashKeys.length > 0) {
      // remove associated Flickr API responses
      removals.push(cache.remove(flickr.cache.keysForPost, apiHashKeys));

      if (includeRelated) {
         // existing API keys implies post views which should also update menus
         viewKeys = viewKeys.concat(menuKeys.slice());
      }
   }
   // remove rendered and compressed views
   removals.push(cache.view.remove(viewKeys));

   Promise.all(removals)
      .then(() => {
         // remove in-memory post cache from library singleton
         library.unload(viewKeys);
         viewKeys.sort();
         res.jsonMessage(viewKeys.join());
      })
      .catch(res.jsonError);
}

/**
 * Delete map cache and update post flag to force reload
 */
function deleteMapCache(req:Blog.Request, res:Blog.Response) {
   const keys = req.body.selected;

   cache.map.remove(keys)
      .then(() => {
         for (const s of keys) {
            // force track to be reloaded
            let p = library.postWithKey(s);
            if (is.value(p)) {
               p.triedTrack = false;

               while (p.nextIsPart) {
                  p = p.next;
                  p.triedTrack = false;
               }
            }
         }
         keys.sort();
         res.jsonMessage(keys.join());
      })
      .catch(res.jsonError);
}

/**
 * Delete API JSON cache
 */
function deleteJsonCache(req:Blog.Request, res:Blog.Response) {
   const keys = req.body.selected;

   cache.remove(keys)
      .then(() => {
         keys.sort();
         res.jsonMessage(keys.join());
      })
      .catch(res.jsonError);
}

export default {
   home,
   updateLibrary,
   cache: {
      deleteView: deleteViewCache,
      deleteMap: deleteMapCache,
      deleteJSON: deleteJsonCache
   }
};