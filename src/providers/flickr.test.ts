import flickr from './flickr';
import config from '../config';

const featureSetID = config.flickr.featureSets[0].id;
const featurePhotoID = '8459503474';
const longTimeout = 5000;

// disable caching so calls hit API
beforeAll(() => {
   config.cache.json = false;
});

// restore caching for other tests
afterAll(() => {
   config.cache.json = true;
});

test(
   'retrieves all collections',
   () =>
      flickr.getCollections().then(json => {
         expect(json).toBeInstanceOf(Array);
      }),
   longTimeout * 2
);

test(
   'catches non-existent set request',
   () =>
      flickr.getSetInfo('45').catch(error => {
         expect(error).toBe(
            'Flickr photosets.getInfo failed for photoset_id 45'
         );
      }),
   longTimeout
);

test(
   'retrieves set information',
   () =>
      flickr.getSetInfo(featureSetID).then(json => {
         expect(json.id).toBe(featureSetID);
      }),
   longTimeout
);

test(
   'retrieves set photos',
   () =>
      flickr.getSetPhotos(featureSetID).then(json => {
         expect(json).toHaveProperty('id', featureSetID);
         expect(json.photo).toBeInstanceOf(Array);
         config.flickr.photoSize.post.forEach(s => {
            // should retrieve all size URLs needed to display post
            expect(json.photo[0]).to.include.keys(s);
         });
      }),
   longTimeout
);

test(
   'retrieves photo EXIF',
   () =>
      flickr.getExif(featurePhotoID).then(json => {
         expect(json).toBeInstanceOf(Array);
      }),
   longTimeout
);

test(
   'retrieves photo sizes',
   () =>
      flickr.getPhotoSizes(featurePhotoID).then(json => {
         expect(json).toBeInstanceOf(Array);
         expect(json[0]).to.include.keys('url');
      }),
   longTimeout
);

test(
   'retrieves all photo tags',
   () =>
      flickr.getAllPhotoTags().then(json => {
         expect(json).toBeInstanceOf(Array);
      }),
   longTimeout
);

test(
   'retrieves photo context',
   () =>
      flickr.getPhotoContext(featurePhotoID).then(json => {
         expect(json).toBeInstanceOf(Array);
         expect(json[0]).toHaveProperty('id', featureSetID);
      }),
   longTimeout
);

test(
   'searches for photos',
   () =>
      flickr.photoSearch('horse').then(json => {
         expect(json).toBeInstanceOf(Array);
         expect(json[0]).toHaveProperty('owner', config.flickr.userID);
      }),
   longTimeout
);
