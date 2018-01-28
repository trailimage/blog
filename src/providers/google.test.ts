import google from './google';
import factory from '../factory';

const authConfig = config.google.auth;

test('creates OAuth client', () => {
   expect(google.auth.client).toBeDefined();
});

test('genenerates authorization URL', () => {
   const url = google.auth.url();
   expect(url).toBeDefined();
   expect(url).to.include(authConfig.clientID);
   expect(url).to.include(config.domain);
});

test('tests for expired access token', () => {
   expect(google.auth.expired()).toBe(true);
   authConfig.token.accessExpiration = new Date() + 1;
   expect(google.auth.expired()).toBe(false);
});

test('refreshes access token', () => {
   authConfig.token.accessExpiration = null;
   return google.auth.verify().then(() => {
      expect(authConfig.token.accessExpiration).toBeDefined();
      expect(authConfig.token.accessExpiration).toBeInstanceOf(Date);
   });
});

test('retrieve GPX file content', () =>
   factory
      .buildLibrary()
      .then(library => library.postWithKey('owyhee-snow-and-sand/lowlands'))
      .then(post => google.drive.loadGPX(post))
      .then(gpxText => {
         expect(gpxText).toBeDefined();
      }));
