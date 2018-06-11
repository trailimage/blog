import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import {
   HttpStatus,
   Header,
   Encoding,
   MimeType,
   addCharSet
} from '@toba/tools';
import { RouteParam } from '../routes';
import { Page } from '../views/';
import { map } from './';
import { loadMockData } from '../.test-data';

const req = new MockRequest();
const res = new MockResponse(req);

beforeAll(async done => {
   await loadMockData();
   console.debug = console.log = jest.fn();
   done();
});

beforeEach(() => {
   res.reset();
});

test('displays map for post', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Mapbox);
      const context = res.rendered.context;
      expect(context).toHaveProperty('post');
      expect(context).toHaveProperty('title', 'Kuna Cave Fails to Impress Map');
      expect(context.post).toHaveProperty('key', 'kuna-cave-fails-to-impress');
      expect(context).toHaveProperty('photoID', 0);
      done();
   };
   req.params[RouteParam.PostKey] = 'kuna-cave-fails-to-impress';

   map.post(req, res);
});

test('displays map for series', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Mapbox);
      const context = res.rendered.context;
      expect(context).toHaveProperty(
         'title',
         'Brother Ride 2015: Huckleberry Lookout Map'
      );
      expect(context).toHaveProperty('photoID', 0);
      expect(context).toHaveProperty('post');
      expect(context.post).toHaveProperty('id', '72157658679070399');
      expect(context.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[RouteParam.SeriesKey] = 'brother-ride-2015';
   req.params[RouteParam.PartKey] = 'huckleberry-lookout';
   map.series(req, res);
});

test('loads GeoJSON for post', done => {
   res.onEnd = () => {
      expect(res.httpStatus).toBe(HttpStatus.OK);
      expect(res.headers).toHaveKeyValue(
         Header.Content.Type,
         addCharSet(MimeType.JSON)
      );
      expect(res.headers).toHaveKeyValue(
         Header.Content.Encoding,
         Encoding.GZip
      );
      expect(res.content).toBeDefined();
      expect(res.content).toHaveLength(1000);
      done();
   };
   req.params[RouteParam.PostKey] = 'stanley-lake-snow-hike';
   map.json.post(req, res);
});

it.skip('downloads GPX', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Mapbox);
      const context = res.rendered.context;
      expect(context).toHaveProperty('title', 'Map');
      expect(context).toHaveProperty('photoID', 0);
      expect(context).toHaveProperty('post');
      expect(context.post).toHaveProperty('id', '72157658679070399');
      expect(context.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[RouteParam.PostKey] = 'stanley-lake-snow-hike';
   map.gpx(req, res);
});
