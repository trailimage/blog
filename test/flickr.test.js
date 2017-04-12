const mocha = require('mocha');
const expect = require('chai').expect;
const flickr = require('../lib/flickr');
const config = require('../lib/config');
const featureSetID = config.flickr.featureSets[0].id;
const featurePhotoID = '8459503474';
const longTimeout = 5000;

describe('Flickr', ()=> {
   // disable caching so calls hit API
   before(() => { config.cache.json = false; });

   it('retrieves all collections', ()=> flickr.getCollections().then(json => {
      expect(json).to.be.instanceOf(Array);
   })).timeout(longTimeout * 2);

   it('catches non-existent set request', ()=> flickr.getSetInfo('45').catch(error => {
      expect(error).equals('Flickr photosets.getInfo failed for photoset_id 45');
   })).timeout(longTimeout);

   it('retrieves set information', ()=> flickr.getSetInfo(featureSetID).then(json => {
      expect(json.id).equals(featureSetID);
   })).timeout(longTimeout);

   it('retrieves set photos', ()=> flickr.getSetPhotos(featureSetID).then(json => {
      expect(json).has.property('id', featureSetID);
      expect(json.photo).to.be.instanceOf(Array);
      config.flickr.photoSize.post.forEach(s => {
         // should retrieve all size URLs needed to display post
         expect(json.photo[0]).to.include.keys(s);
      });
   })).timeout(longTimeout);

   it('retrieves photo EXIF', ()=> flickr.getExif(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
   })).timeout(longTimeout);

   it('retrieves photo sizes', ()=> flickr.getPhotoSizes(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).to.include.keys('url');
   })).timeout(longTimeout);

   it('retrieves all photo tags', ()=> flickr.getAllPhotoTags().then(json => {
      expect(json).to.be.instanceOf(Array);
   })).timeout(longTimeout);

   it('retrieves photo context', ()=> flickr.getPhotoContext(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).has.property('id', featureSetID);
   })).timeout(longTimeout);

   it('searches for photos', ()=> flickr.photoSearch('horse').then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).has.property('owner', config.flickr.userID);
   })).timeout(longTimeout);

   // restore caching for other tests
   after(() => { config.cache.json = true; });
});