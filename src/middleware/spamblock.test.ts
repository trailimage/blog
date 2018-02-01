import { httpStatus } from '../constants';
import cache from '../cache/index';
import { blockSpamReferers } from './spamblock';

beforeEach(() => {
   res.reset();
   req.reset();
});

test('finds referred client IP for hosted node instances', () => {
   req.connection.remoteAddress = 'remote';
   expect(req.clientIP()).toBe('remote');

   req.headers['x-forwarded-for'] = 'value1, value2';
   expect(req.clientIP()).toBe('value1');
});

test('blocks black-listed URLs', done => {
   req.referer = 'http://2323423423.copyrightclaims.org';
   res.onEnd = error => {
      expect(error).not.toBeDefined();
      expect(res.ended).toBe(true);
      expect(res.httpStatus).equals(httpStatus.NOT_FOUND);
      done();
   };
   middleware.blockSpamReferers(req, res, res.onEnd);
});

test('allows unlisted URLs', done => {
   req.referer = 'http://microsoft.com';
   res.onEnd = error => {
      expect(error).not.toBeDefined();
      expect(res.httpStatus).not.equals(httpStatus.NOT_FOUND);
      done();
   };
   blockSpamReferers(req, res, res.onEnd);
});

test('caches black list', done => {
   res.onEnd = () => {
      cache.gettestem(middleware.spamBlackListCacheKey).then(value => {
         expect(value).toBeDefined();
         expect(value).to.be.an('array');
         expect(value.length).at.least(100);
         done();
      });
   };
   blockSpamReferers(req, res, res.onEnd);
});

test.skip('refreshes the cache after a period of time', () => {
   // needs to call private method
});
