import { env } from '@toba/tools';
import { mapSource } from './mapsource';

export const bing = {
   key: env('BING_KEY', null)
};

/**
 * https://developers.facebook.com/docs/reference/plugins/like/
 * https://developers.facebook.com/apps/110860435668134/summary
 */
export const facebook = {
   appID: '110860435668134',
   pageID: '241863632579825',
   siteID: '578261855525416',
   adminID: '1332883594',
   enabled: true,
   authorURL: 'https://www.facebook.com/jason.e.abbott'
};

export const google = {
   apiKey: env('GOOGLE_KEY', null),
   projectID: '316480757902',
   analyticsID: '22180727', // shown as 'UA-22180727-1
   searchEngineID: env('GOOGLE_SEARCH_ID', null),
   blogID: '118459106898417641'
};

export const mapbox = {
   accessToken: env('MAPBOX_ACCESS_TOKEN'),
   style: {
      /** Style used for interactive maps */
      dynamic: 'jabbott7/cj1qniq9r00322sqxt3pastcf',
      /** Style used for static maps */
      static: 'jabbott7/cj1prg25g002o2ro2xtzos6cy'
   },
   mapSource
};
