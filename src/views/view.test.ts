import '@toba/test';
import { Header, MimeType } from '@toba/node-tools';
import { MockRequest, MockResponse } from '@toba/test';
import {
   cache,
   view,
   createViewItem,
   writeItemToResponse,
   IPv6,
   Renderer
} from './view';
import { config } from '../config/';

const req = new MockRequest();
const res = new MockResponse(req);
const viewSlug = 'test-slug';
const pageContent = '<html><head></head><body>Test Page</body></html>';
const wasCaching = config.cache.views;

beforeEach(() => {
   res.reset();
   req.reset();
});

beforeAll(() => {
   config.cache.views = true;
});

afterAll(() => {
   config.cache.views = wasCaching;
});

test('compresses new pages and adds to cache', done => {
   res.onEnd = () => {
      const item = cache.get(viewSlug);
      expect(item).not.toBeNull();
      expect(item!.eTag.includes(viewSlug)).toBe(true);
      expect(item!.buffer).toBeInstanceOf(Buffer);
      done();
   };
   res.endOnRender = false;

   view.send(res, viewSlug, (render: Renderer) => {
      // mock response echoes back parameters instead of rendering view
      render('test-template', {
         option1: 'value1',
         option2: 'value2'
      });
   });
});

test('truncates IPv6 to v4', () => {
   expect(IPv6('::1')).toBe('127.0.0.1');
   expect(IPv6('192.12.15.3')).toBe('192.12.15.3');
   expect(IPv6('::abf2:192.12.15.3')).toBe('192.12.15.3');
});

test('sends already rendered pages from cache', done => {
   res.onEnd = done;
   view.send(res, viewSlug, (_render: Renderer) => {
      throw new Error('Attempt to render page that should be cached');
   });
});

test('adds caching headers to compressed content', async () => {
   const item = await createViewItem(viewSlug, pageContent, MimeType.HTML);

   writeItemToResponse(res, item);
   expect(res.header(Header.CacheControl)).toBe('max-age=86400, public');

   const eTagHeader = res.header(Header.eTag);
   expect(eTagHeader).toBeDefined();
   expect(eTagHeader.includes(viewSlug)).toBe(true);
});
