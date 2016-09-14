'use strict';

const mocha = require('mocha');
const config = require('../lib/config');
const { expect } = require('chai');
const google = require('../lib/google');
const factory = require('../lib/factory');
const res = require('./mocks/response.mock');
const authConfig = config.google.auth;

describe('Google', ()=> {
   describe('OAuth', ()=> {
      it('creates client', ()=> {
         expect(google.auth.client).to.exist;
      });

      it('genenerates authorization URL', ()=> {
         const url = google.auth.url();
         expect(url).to.exist;
         expect(url).to.include(authConfig.clientID);
         expect(url).to.include(config.domain);
      });

      it('tests for expired access token', ()=> {
         expect(google.auth.expired()).is.true;
         authConfig.token.accessExpiration = new Date() + 1;
         expect(google.auth.expired()).is.false;
      });

      it('refreshes access token', ()=> {
         authConfig.token.accessExpiration = null;
         return google.auth.verify().then(() => {
            expect(authConfig.token.accessExpiration).to.exist;
            expect(authConfig.token.accessExpiration).is.instanceOf(Date);
         });
      });
   });

   describe('Drive', ()=> {
      let post = null;

      before(() => factory.buildLibrary().then(library => {
         post = library.postWithKey('owyhee-snow-and-sand/lowlands');
         return true;
      }));

      it('stream GPX file to response', ()=> {
         return google.drive.loadGPX(post, res).then(gpx => {
            expect(res).to.exist;
         })
      });

      it.skip('converts a GPX file to GeoJSON', ()=> {

      });
   });
});