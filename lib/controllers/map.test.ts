import { HttpStatus, Header, Encoding, MimeType } from '@toba/tools';
import { RouteParam } from '../routes';
// const { prepare, expectTemplate } = require('./index.test');
import { Page } from '../views/';
import { map } from './';
import { expectTemplate } from './index.test';

test('displays map for post', () => {
   const { req, res } = createContext();

   res.onEnd = () => {
      const options = expectTemplate(Page.Mapbox);
      expect(options).toHaveProperty('post');
      expect(options).toHaveProperty('title', 'Kuna Cave Fails to Impress Map');
      expect(options.post).toHaveProperty('key', 'kuna-cave-fails-to-impress');
      expect(options).toHaveProperty('photoID', 0);
   };
   req.params[RouteParam.PostKey] = 'kuna-cave-fails-to-impress';

   map.post(req, res);
});

test('displays map for series', () => {
   res.onEnd = () => {
      const options = expectTemplate(Page.Mapbox);
      expect(options).toHaveProperty(
         'title',
         'Brother Ride 2015: Huckleberry Lookout Map'
      );
      expect(options).toHaveProperty('photoID', 0);
      expect(options).toHaveProperty('post');
      expect(options.post).toHaveProperty('id', '72157658679070399');
      expect(options.post).toHaveProperty('isPartial', true);
   };
   req.params[RouteParam.SeriesKey] = 'brother-ride-2015';
   req.params[RouteParam.PartKey] = 'huckleberry-lookout';
   map.series(req, res);
});

test('loads GeoJSON for post', done => {
   res.onEnd = () => {
      expect(res.httpStatus).equals(HttpStatus.OK);
      expect(res.headers).toHaveProperty(Header.Content.Type);
      expect(res.headers[Header.Content.Type]).to.include(MimeType.JSON);
      expect(res.headers).toHaveProperty(
         Header.Content.Encoding,
         Encoding.GZip
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
      const options = expectTemplate(Page.Mapbox);
      expect(options).toHaveProperty('title', 'Map');
      expect(options).toHaveProperty('photoID', 0);
      expect(options).toHaveProperty('post');
      expect(options.post).toHaveProperty('id', '72157658679070399');
      expect(options.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[RouteParam.PostKey] = 'stanley-lake-snow-hike';
   map.gpx(req, res);
});
