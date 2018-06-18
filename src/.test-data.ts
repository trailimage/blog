import { config as modelConfig, blog } from '@trailimage/models';
import { postProvider } from '@trailimage/flickr-provider';
import { mapProvider } from '@trailimage/google-provider';
import { config } from './config';

export function loadMockData() {
   postProvider.configure(config.providers.post);
   mapProvider.configure(config.providers.map);

   modelConfig.owner = config.owner;
   modelConfig.subtitleSeparator = config.posts.subtitleSeparator;
   modelConfig.maxPhotoMarkersOnMap = config.providers.map.maxMarkers;
   modelConfig.providers.post = postProvider;
   modelConfig.providers.map = mapProvider;
   modelConfig.site = config.site;

   return blog.load();
}
