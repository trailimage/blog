import '@toba/test';
import { config as flickrConfig } from '@trailimage/flickr-provider';
import { config as googleConfig } from '@trailimage/google-provider';
import { config as modelConfig } from '@trailimage/models';
import { config } from './config';
import { configureModels } from './app';

test('applies configuration to providers', () => {
   configureModels();

   expect(flickrConfig.api.appID).toBe(config.providers.post.api.appID);
   expect(googleConfig.api.apiKey).toBe(config.providers.map.api.apiKey);
   expect(modelConfig.owner.name).toBe(config.owner.name);
});
