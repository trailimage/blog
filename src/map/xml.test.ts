import { DOMParser as DOM } from 'xmldom';
import xml from './xml';

const doc = new DOM().parseFromString(
   '<trkpt lat="43.238334" lon="-116.366600">' +
      '<ele>926.90</ele>' +
      '<time>2013-11-02T18:54:59Z</time>' +
      '<fix>3d</fix>' +
      '</trkpt>'
);

test('returns first node of given type', () => {
   const node = xml.firstNode(doc, 'trkpt');
   expect(node).toBeDefined();
});

test('converts XML attributes to numbers', () => {
   const node = xml.firstNode(doc, 'trkpt');
   expect(xml.numberAttribute(node, 'lat')).toBe(43.238334);
   expect(xml.numberAttribute(node, 'lon')).toBe(-116.3666);
});

test('returns node content', () => {
   const node = xml.firstNode(doc, 'ele');
   expect(xml.value(node)).toBe('926.90');
});
