// add helper expando methods
beforeAll(done => {
   middleware.enableStatusHelpers(req, res, done);
});

const viewSlug = 'test-slug';
const pageContent = '<html><head></head><body>Test Page</body></html>';
let cacheViews = false;

before(() => {
   cacheViews = config.cache.views;
   config.cache.views = true;
});

// remove any left-over test data and add caching expando methods
before(done => {
   cache.view.remove(viewSlug).then(() => {
      middleware.enableViewCache(req, res, done);
   });
});

it('compresses new pages and adds to cache', done => {
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

it('sends already rendered pages from cache', done => {
   res.onEnd = done;
   res.sendView(viewSlug, {
      callback: () => {
         throw new Error('Attempt to render page that should be cached');
      }
   });
});

it('adds caching headers to compressed content', () =>
   cache.view.create(viewSlug, pageContent).then(item => {
      res.sendCompressed(C.mimeType.HTML, item);

      expect(res.headers[C.header.CACHE_CONTROL]).equals(
         'max-age=86400, public'
      );
      expect(res.headers[C.header.E_TAG]).to.contain(viewSlug);
      //expect(res.content).equals(pageContent);
   }));

// remove test page from cache
after(() => {
   cache.view.remove(viewSlug);
   config.cache.views = cacheViews;
});
