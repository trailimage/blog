const C = require('../../lib/constants').default;
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate } = require('./index.test');
const template = require('../../lib/template').default;
const mocha = require('mocha');
const { expect } = require('chai');
const map = require('../../lib/controllers/map').default;
const ph = C.route;

describe('Map', () => {
   before(done => {
      prepare(done);
      map.inject.google = require('../mocks/google.mock');
   });
   beforeEach(() => {
      res.reset();
      req.reset();
   });

   it('displays map for post', done => {
      res.onEnd = () => {
         const options = expectTemplate(template.page.MAPBOX);
         expect(options).has.property('post');
         expect(options).has.property(
            'title',
            'Kuna Cave Fails to Impress Map'
         );
         expect(options.post).has.property('key', 'kuna-cave-fails-to-impress');
         expect(options).has.property('photoID', 0);
         done();
      };
      req.params[ph.POST_KEY] = 'kuna-cave-fails-to-impress';
      map.post(req, res);
   });

   it('displays map for series', done => {
      res.onEnd = () => {
         const options = expectTemplate(template.page.MAPBOX);
         expect(options).has.property(
            'title',
            'Brother Ride 2015: Huckleberry Lookout Map'
         );
         expect(options).has.property('photoID', 0);
         expect(options).has.property('post');
         expect(options.post).has.property('id', '72157658679070399');
         expect(options.post).has.property('isPartial', true);
         done();
      };
      req.params[ph.SERIES_KEY] = 'brother-ride-2015';
      req.params[ph.PART_KEY] = 'huckleberry-lookout';
      map.series(req, res);
   });

   it('loads GeoJSON for post', done => {
      res.onEnd = () => {
         expect(res.httpStatus).equals(C.httpStatus.OK);
         expect(res.headers).has.property(C.header.content.TYPE);
         expect(res.headers[C.header.content.TYPE]).to.include(C.mimeType.JSON);
         expect(res.headers).has.property(
            C.header.content.ENCODING,
            C.encoding.GZIP
         );
         expect(res.content).to.exist;
         expect(res.content).is.length.above(1000);
         done();
      };
      req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
      map.json.post(req, res);
   });

   it.skip('downloads GPX', done => {
      res.onEnd = () => {
         const options = expectTemplate(template.page.MAP);
         expect(options).has.property('title', 'Map');
         expect(options).has.property('photoID', 0);
         expect(options).has.property('post');
         expect(options.post).has.property('id', '72157658679070399');
         expect(options.post).has.property('isPartial', true);
         done();
      };
      req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
      map.gpx(req, res);
   });
});
