import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Page } from '../views/';
import { post } from './';
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

test('shows latest', done => {
   res.endOnRender = false;
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Post);
      const context = res.rendered.context;
      expect(context).toHaveProperty('slug', 'stanley-lake-snow-hike');
      expect(context!.layout).toBeNull();
      done();
   };
   post.latest(req, res);
});

test('forwards to correct URL from Flickr set ID', done => {
   res.onEnd = () => {
      expect(res).toRedirectTo('/ruminations');
      done();
   };
   expect(config.providers.post).toBeDefined();
   expect(config.providers.post!.featureSets).toBeDefined();
   req.params[RouteParam.PostID] = config.providers.post!.featureSets![0].id;
   post.withID(req, res);
});

test('redirects to post containing photo', done => {
   res.onEnd = () => {
      expect(res).toRedirectTo('/ruminations#8458410907');
      done();
   };
   req.params[RouteParam.PhotoID] = '8458410907';
   post.withPhoto(req, res);
});

test('shows post with slug', done => {
   res.endOnRender = false;
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Post);
      const context = res.rendered.context;
      expect(context).toHaveProperty('title', 'Kuna Cave Fails to Impress');
      expect(context).toHaveProperty('post');
      expect(context!.post).toHaveProperty('id', '72157668896453295');
      expect(context!.post).toHaveProperty('isPartial', false);
      done();
   };
   req.params[RouteParam.PostKey] = 'kuna-cave-fails-to-impress';
   post.withKey(req, res);
});

test('shows post in series', done => {
   res.endOnRender = false;
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.Post);
      const context = res.rendered.context;
      expect(context).toHaveProperty('title', 'Brother Ride 2015');
      expect(context).toHaveProperty('post');
      expect(context!.post).toHaveProperty('id', '72157658679070399');
      expect(context!.post).toHaveProperty('isPartial', true);
      done();
   };
   req.params[RouteParam.SeriesKey] = 'brother-ride-2015';
   req.params[RouteParam.PartKey] = 'huckleberry-lookout';
   post.inSeries(req, res);
});
