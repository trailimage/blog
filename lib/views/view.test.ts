import '@toba/test';
import { Header, MimeType } from '@toba/tools';
import { MockRequest, MockResponse } from '@toba/test';
import { cache, view, createViewItem } from './view';

const req = new MockRequest();
const res = new MockResponse(req);
const viewSlug = 'test-slug';
const pageContent = '<html><head></head><body>Test Page</body></html>';

beforeEach(() => {
   res.reset();
   req.reset();
});

test('compresses new pages and adds to cache', done => {
   res.onEnd = () => {
      const item = cache.get(viewSlug);
      expect(item).toBeDefined();
      expect(item.eTag).toHaveProperty(viewSlug);
      expect(item.buffer).toBeInstanceOf(Buffer);
      done();
   };
   res.endOnRender = false;
   view.send(res, viewSlug, {
      ifNotCached: render => {
         // mock response echoes back parameters instead of rendering view
         render('test-template', {
            option1: 'value1',
            option2: 'value2'
         });
      }
   });
});

test('sends already rendered pages from cache', done => {
   res.onEnd = done;
   view.send(res, viewSlug, {
      ifNotCached: () => {
         throw new Error('Attempt to render page that should be cached');
      }
   });
});

test('adds caching headers to compressed content', async () => {
   const item = await createViewItem(viewSlug, pageContent);
   //cache.add(slug, item);
   view.sendCompressed(res, MimeType.HTML, item);

   expect(res.headers[Header.CacheControl]).toBe('max-age=86400, public');
   expect(res.headers[Header.eTag]).toHaveProperty(viewSlug);
});
