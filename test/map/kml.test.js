const kml = require('../../lib/map/kml').default;
const mocha = require('mocha');
const { expect } = require('chai');
const mock = require('../mocks/');

describe('KML', ()=> {
   it('extracts KML from KMZ', ()=> mock.loadFile('mines.kmz')
      .then(kml.fromKMZ)
      .then(doc => {
         expect(doc).to.exist;
      })
   );
});
