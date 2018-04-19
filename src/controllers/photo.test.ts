import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { alphabet } from '@toba/tools';
import { RouteParam } from '../routes';
import { Page } from '../views/';
import { photo } from './';
import { expectTemplate } from './index.test';

const req = new MockRequest();
const res = new MockResponse(req);

beforeEach(() => {
   res.reset();
   req.reset();
});

it('loads all photo tags', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.PhotoTag);
      expect(options).toHaveProperty('alphabet', alphabet);
      expect(options).toHaveProperty('tags');
      expect(options.tags).toHaveAllProperties('a', 'b', 'c');
      done();
   };
   photo.tags(req, res);
});

it('shows all photos with tag', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.PhotoSearch);
      expect(options).toHaveProperty('photos');
      expect(options.photos).toBeInstanceOf(Array);
      expect(options.photos).toHaveLength(10);
      done();
   };
   req.params[RouteParam.PhotoTag] = 'horse';
   photo.withTag(req, res);
});

it('loads EXIF', done => {
   res.onEnd = () => {
      const options = expectTemplate(res, Page.EXIF);
      expect(options).toHaveProperty('EXIF');
      expect(options.EXIF).toHaveAllProperties(
         'ISO',
         'artist',
         'lens',
         'model'
      );
      expect(options.EXIF).toHaveProperty('sanitized', true);
      done();
   };
   req.params[RouteParam.PhotoID] = '8458410907';
   photo.exif(req, res);
});
