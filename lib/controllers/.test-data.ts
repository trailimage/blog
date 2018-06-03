import { config as modelConfig, blog } from '@trailimage/models';
import { postProvider, postConfigure } from '@trailimage/flickr-provider';
import { mapProvider, mapConfigure } from '@trailimage/google-provider';
import { config } from '../config';

export function loadMockData() {
   postConfigure(config.providers.post);
   mapConfigure(config.providers.map);

   modelConfig.owner = config.owner;
   modelConfig.subtitleSeparator = config.posts.subtitleSeparator;
   modelConfig.maxPhotoMarkersOnMap = config.map.maxMarkers;
   modelConfig.providers.post = postProvider;
   modelConfig.providers.map = mapProvider;
   modelConfig.site = config.site;

   return blog.load();
}
