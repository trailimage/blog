'use strict';

const mocha = require('mocha');
const config = require('../lib/config');
const { expect } = require('chai');
const google = require('../lib/google');

describe('Google', ()=> {
   describe('OAuth', ()=> {
      it('creates client', ()=> {
         expect(google.auth.client).to.exist;
      });

      it('genenerates authorization URL', ()=> {
         const url = google.auth.url();
         expect(url).to.exist;
         expect(url).to.include(config.google.auth.clientID);
      });
   });

   describe('Drive', ()=> {
      // let drive = new GoogleFile({
      //    apiKey: config.env('GOOGLE_DRIVE_KEY'),
      //    tracksFolder: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
      //    auth: new OAuthOptions(2,
      //       config.env('GOOGLE_CLIENT_ID'),
      //       config.env('GOOGLE_SECRET'),
      //       `http://www.${config.domain}/auth/google`,
      //       process.env['GOOGLE_ACCESS_TOKEN'],
      //       process.env['GOOGLE_REFRESH_TOKEN'])
      // });

      it.skip('authenticates Google Drive access', done => {
         drive.auth.verify(ready => {
            expect(ready).is.true;
            done();
         })
      });


      it.skip('converts a GPX file to GeoJSON', ()=> {

      });
   });
});