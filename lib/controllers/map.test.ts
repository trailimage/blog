import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { HttpStatus, Header, Encoding, MimeType } from '@toba/tools';
import { RouteParam } from '../routes';
import { Page } from '../views/';
import { map } from './';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

test('displays map for post', () => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Mapbox);
      const context = res.rendered.context;
      expect(context).toHaveProperty('post');
      expect(context).toHaveProperty('title', 'Kuna Cave Fails to Impress Map');
      expect(context.post).toHaveProperty('key', 'kuna-cave-fails-to-impress');
      expect(context).toHaveProperty('photoID', 0);
   };
   req.params[RouteParam.PostKey] = 'kuna-cave-fails-to-impress';

   map.post(req, res);
});

test('displays map for series', () => {
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
   };
   req.params[RouteParam.SeriesKey] = 'brother-ride-2015';
   req.params[RouteParam.PartKey] = 'huckleberry-lookout';
   map.series(req, res);
});

test('loads GeoJSON for post', done => {
   res.onEnd = () => {
      expect(res.httpStatus).toBe(HttpStatus.OK);
      expect(res.headers).toHaveProperty(Header.Content.Type);
      expect(res.headers[Header.Content.Type]).toHaveProperty(MimeType.JSON);
      expect(res.headers).toHaveProperty(
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
