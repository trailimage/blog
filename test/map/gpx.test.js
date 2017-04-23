const gpx = require('../../lib/map/gpx');
const mocha = require('mocha');
const { expect } = require('chai');
const DOM = require('xmldom').DOMParser;

describe('GPX', ()=> {
   const xml = new DOM().parseFromString('<trkpt lat="43.238334" lon="-116.366600">'
      + '<ele>926.90</ele>'
      + '<time>2013-11-02T18:54:59Z</time>'
      + '<fix>3d</fix>'
      + '</trkpt>');

   it('returns first node of given type', ()=> {
      const node = gpx.firstNode(xml, 'trkpt');
      expect(node).is.not.empty;
   });

   it('converts XML attributes to numbers', ()=> {
      const node = gpx.firstNode(xml, 'trkpt');
      expect(gpx.numberAttribute(node, 'lat')).equals(43.238334);
      expect(gpx.numberAttribute(node, 'lon')).equals(-116.3666);
   });

   it('returns node content', ()=> {
      const node = gpx.firstNode(xml, 'ele');
      expect(gpx.value(node)).equals('926.90');
   });
});
