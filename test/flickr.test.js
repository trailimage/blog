'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const flickr = require('../lib/flickr');
const config = require('../lib/config');
const featureSetID = config.flickr.featureSets[0].id;
const featurePhotoID = '8459503474';

describe('Flickr', ()=> {
   // disable caching so calls hit API
   before(() => { config.cache.json = false; });

	it('retrieves all collections', ()=> flickr.getCollections().then(json => {
      expect(json).to.be.instanceOf(Array);
	}));

   it('catches non-existent set request', ()=> flickr.getSetInfo('45').catch(error => {
      expect(error).equals('Flickr photosets.getInfo failed for photoset_id 45');
   }));

   it('retrieves set information', ()=> flickr.getSetInfo(featureSetID).then(json => {
      expect(json.id).equals(featureSetID);
   }));

   it('retrieves set photos', ()=> flickr.getSetPhotos(featureSetID).then(json => {
      expect(json).has.property('id', featureSetID);
      expect(json.photo).to.be.instanceOf(Array);
      config.flickr.photoSize.post.forEach(s => {
         // should retrieve all size URLs needed to display post
         expect(json.photo[0]).to.include.keys(s);
      });
   }));

   it('retrieves photo EXIF', ()=> flickr.getExif(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
   }));

   it('retrieves photo sizes', ()=> flickr.getPhotoSizes(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).to.include.keys('url');
   }));

   it('retrieves all photo tags', ()=> flickr.getAllPhotoTags().then(json => {
      expect(json).to.be.instanceOf(Array);
   }));

   it('retrieves photo context', ()=> flickr.getPhotoContext(featurePhotoID).then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).has.property('id', featureSetID);
   }));

   it('searches for photos', ()=> flickr.photoSearch('horse').then(json => {
      expect(json).to.be.instanceOf(Array);
      expect(json[0]).has.property('owner', config.flickr.userID);
   }));

   // restore caching for other tests
   after(() => { config.cache.json = true; });
});