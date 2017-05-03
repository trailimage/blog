const kml = require('../lib/map/kml');
const mocha = require('mocha');
const { expect } = require('chai');
const mock = require('../mocks/');

describe('KML', ()=> {
   it('extracts KML from KMZ', ()=> mock.loadStream('mines.kmz').then(stream => {
      const kml = kml.fromKMZ(stream);
      expect(kml).to.exist;
   }));
      //.timeout(20000);
});
