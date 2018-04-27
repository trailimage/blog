import { config } from '../config';
import { cache } from './view';

const viewSlug = 'test-slug';
const pageContent = '<html><head></head><body>Test Page</body></html>';
let cacheViews = false;

beforeAll(() => {
   cacheViews = config.cache.views;
   config.cache.views = true;
});

// remove test page from cache
afterEach(() => {
   cache.remove(viewSlug);
   config.cache.views = cacheViews;
});

test('Compresses new pages and adds to cache', done => {
   res.onEnd = () => {
      cache.view.getItem(viewSlug).then(item => {
         expect(item).to.exist;
         expect(item.eTag).to.contain(viewSlug);
         expect(item.buffer).to.be.instanceOf(Buffer);
         done();
      });
   };
   res.endOnRender = false;
   res.sendView(viewSlug, {
      callback: render => {
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
   res.sendView(viewSlug, {
      callback: () => {
         throw new Error('Attempt to render page that should be cached');
      }
   });
});

test('adds caching headers to compressed content', () =>
   cache.view.create(viewSlug, pageContent).then(item => {
      res.sendCompressed(C.mimeType.HTML, item);

      expect(res.headers[C.header.CACHE_CONTROL]).equals(
         'max-age=86400, public'
      );
      expect(res.headers[C.header.E_TAG]).to.contain(viewSlug);
      //expect(res.content).equals(pageContent);
   }));
