import '@toba/test';
import { MockRequest, MockResponse } from '@toba/test';
import { alphabet } from '@toba/tools';
import { RouteParam } from '../routes';
import { Page } from '../views/';
import { photo } from './';
import { normalizeTag } from './photo';
import { loadMockData } from './.test-data';
import { config } from '../config';

const req = new MockRequest();
const res = new MockResponse(req);

beforeAll(async done => {
   await loadMockData();
   console.debug = jest.fn();
   done();
});

beforeEach(() => {
   res.reset();
   req.reset();
});

test('normalizes photo tags', () => {
   config.photoTagChanges['old-slug'] = 'new-slug';
   expect(normalizeTag('Camel-Case')).toBe('camel-case');
   expect(normalizeTag('old-slug')).toBe('new-slug');
   expect(normalizeTag(undefined)).toBeNull();
});

test('loads all photo tags', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.PhotoTag);
      const context = res.rendered.context;
      expect(context).toHaveProperty('alphabet', alphabet);
      expect(context).toHaveAllProperties('tags', 'selected');
      expect(context.tags).toHaveAllProperties('a', 'b', 'c');
      expect(context.tags['c']).toHaveProperty('cactus', 'Cactus');
      done();
   };
   photo.tags(req, res);
});

test('shows all photos with tag', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.PhotoSearch);
      const context = res.rendered.context;
      expect(context).toHaveProperty('photos');
      expect(context.photos).toBeInstanceOf(Array);
      expect(context.photos).toHaveLength(19);
      done();
   };
   req.params[RouteParam.PhotoTag] = 'horse';
   photo.withTag(req, res);
});

test('loads EXIF', done => {
   res.onEnd = () => {
      expect(res).toRenderTemplate(Page.EXIF);
      const context = res.rendered.context;
      expect(context).toHaveProperty('EXIF');
      expect(context.EXIF).toHaveAllProperties(
         'ISO',
         'artist',
         'lens',
         'model'
      );
      expect(context.EXIF).toHaveProperty('sanitized', true);
      done();
   };
   req.params[RouteParam.PhotoID] = '8458410907';
   photo.exif(req, res);
});
