'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const flickr = require('../lib/flickr');
const config = require('../lib/config');
const featureSetID = config.flickr.featureSets[0].id;
const featurePhotoID = '8459503474';

describe('Flickr', ()=> {
	it('retrieves all collections', ()=> {
		return flickr.getCollections().then(json => {
   	   expect(json).to.be.instanceOf(Array);
      })
	});
   it('catches non-existent set request', ()=> {
      return flickr.getSetInfo('45').catch(error => {
         expect(error).equals('Flickr photosets.getInfo failed for photoset_id 45');
      });
   });

   it('retrieves set information', ()=> {
      return flickr.getSetInfo(featureSetID).then(json => {
         expect(json.id).equals(featureSetID);
      });
   });

   it('retrieves set photos', ()=> {
      return flickr.getSetPhotos(featureSetID).then(json => {
         expect(json.id).equals(featureSetID);
         expect(json.photo).to.be.instanceOf(Array);
         config.flickr.photoSize.post.forEach(s => {
            expect(json.photo[0]).to.include.keys(s);
         });
      });
   });

   it('retrieves photo EXIF', ()=> {
      return flickr.getExif(featurePhotoID).then(json => {
         expect(json).to.be.instanceOf(Array);
      });
   });

   it('retrieves photo sizes', ()=> {
      return flickr.getPhotoSizes(featurePhotoID).then(json => {
         expect(json).to.be.instanceOf(Array);
         expect(json[0]).to.include.keys('url');
      });
   });

   it('retrieves all photo tags', ()=> {
      return flickr.getAllPhotoTags().then(json => {
         expect(json).to.be.instanceOf(Array);
      });
   });

   it('retrieves photo context', ()=> {
      return flickr.getPhotoContext(featurePhotoID).then(json => {
         expect(json).to.be.instanceOf(Array);
         expect(json[0]).to.include.keys('id');
         expect(json[0].id).equals(featureSetID);
      });
   });

   it('searches for photos', ()=> {
      return flickr.photoSearch('horse').then(json => {
         expect(json).to.be.instanceOf(Array);
         expect(json[0]).to.include.keys('owner');
         expect(json[0].owner).equals(config.flickr.userID);
      });
   });
});