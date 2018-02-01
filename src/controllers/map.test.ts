import { route as ph, httpStatus, header } from '../constants';
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate } = require('./index.test');
import template from '../template';
import map from './map';

beforeAll(done => {
   prepare(done);
   map.inject.google = require('../mocks/google.mock');
});

beforeEach(() => {
   res.reset();
   req.reset();
});

test('displays map for post', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.MAPBOX);
      expect(options).toHaveProperty('post');
      expect(options).toHaveProperty('title', 'Kuna Cave Fails to Impress Map');
      expect(options.post).toHaveProperty('key', 'kuna-cave-fails-to-impress');
      expect(options).toHaveProperty('photoID', 0);
      done();
   };
   req.params[ph.POST_KEY] = 'kuna-cave-fails-to-impress';
   map.post(req, res);
});

test('displays map for series', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.MAPBOX);
      expect(options).toHaveProperty(
         'title',
         'Brother Ride 2015: Huckleberry Lookout Map'
      );
      expect(options).toHaveProperty('photoID', 0);
      expect(options).toHaveProperty('post');
      expect(options.post).toHaveProperty('id', '72157658679070399');
      expect(options.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[ph.SERIES_KEY] = 'brother-ride-2015';
   req.params[ph.PART_KEY] = 'huckleberry-lookout';
   map.series(req, res);
});

test('loads GeoJSON for post', done => {
   res.onEnd = () => {
      expect(res.httpStatus).equals(httpStatus.OK);
      expect(res.headers).toHaveProperty(header.content.TYPE);
      expect(res.headers[C.header.content.TYPE]).to.include(C.mimeType.JSON);
      expect(res.headers).toHaveProperty(
         C.header.content.ENCODING,
         C.encoding.GZIP
      );
      expect(res.content).toBeDefined();
      expect(res.content).is.length.above(1000);
      done();
   };
   req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
   map.json.post(req, res);
});

it.skip('downloads GPX', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.MAPBOX);
      expect(options).toHaveProperty('title', 'Map');
      expect(options).toHaveProperty('photoID', 0);
      expect(options).toHaveProperty('post');
      expect(options.post).toHaveProperty('id', '72157658679070399');
      expect(options.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
   map.gpx(req, res);
});
