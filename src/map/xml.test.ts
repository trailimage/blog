const xml = require('../../lib/map/xml').default;
const mocha = require('mocha');
const { expect } = require('chai');
const DOM = require('xmldom').DOMParser;

describe('Map XML', () => {
   const doc = new DOM().parseFromString(
      '<trkpt lat="43.238334" lon="-116.366600">' +
         '<ele>926.90</ele>' +
         '<time>2013-11-02T18:54:59Z</time>' +
         '<fix>3d</fix>' +
         '</trkpt>'
   );

   it('returns first node of given type', () => {
      const node = xml.firstNode(doc, 'trkpt');
      expect(node).is.not.empty;
   });

   it('converts XML attributes to numbers', () => {
      const node = xml.firstNode(doc, 'trkpt');
      expect(xml.numberAttribute(node, 'lat')).equals(43.238334);
      expect(xml.numberAttribute(node, 'lon')).equals(-116.3666);
   });

   it('returns node content', () => {
      const node = xml.firstNode(doc, 'ele');
      expect(xml.value(node)).equals('926.90');
   });
});
