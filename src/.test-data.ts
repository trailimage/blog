import { config as modelConfig, blog } from '@trailimage/models';
import {
   postProvider,
   config as flickrConfig
} from '@trailimage/flickr-provider';
import {
   mapProvider,
   config as googleConfig
} from '@trailimage/google-provider';
import { config } from './config';

export function loadMockData() {
   Object.assign(googleConfig, config.providers.map);
   Object.assign(flickrConfig, config.providers.post);

   modelConfig.owner = config.owner;
   modelConfig.subtitleSeparator = config.posts.subtitleSeparator;
   modelConfig.maxPhotoMarkersOnMap = config.map.maxMarkers;
   modelConfig.providers.post = postProvider;
   modelConfig.providers.map = mapProvider;
   modelConfig.site = config.site;

   return blog.load();
}
