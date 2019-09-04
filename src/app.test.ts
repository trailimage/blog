import '@toba/test';
import { postProvider } from '@trailimage/flickr-provider';
import { mapProvider } from '@trailimage/google-provider';
import { config as modelConfig } from '@trailimage/models';
import { config } from './config';
import { configureModels } from './app';

test('applies configuration to providers', () => {
   configureModels();

   expect(postProvider.config.api).toBeDefined();
   expect(config.providers.post.api).toBeDefined();
   expect(modelConfig.owner).toBeDefined();

   expect(postProvider.config.api!.appID).toBe(
      config.providers.post.api!.appID
   );
   expect(mapProvider.config.api.apiKey).toBe(config.providers.map.api.apiKey);
   expect(modelConfig.owner!.name).toBe(config.owner.name);
});
