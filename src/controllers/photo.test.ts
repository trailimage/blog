import { route as ph } from '../constants';
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
import { prepare, expectTemplate } from './index.test';
import template from '../template';
import photo from './photo';

beforeAll(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

it('loads all photo tags', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.PHOTO_TAG);
      expect(options).toHaveProperty('alphabet', C.alphabet);
      expect(options).toHaveProperty('tags');
      expect(options.tags).to.contain.all.keys(['a', 'b', 'c']);
      done();
   };
   photo.tags(req, res);
});

it('shows all photos with tag', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.PHOTO_SEARCH);
      expect(options).toHaveProperty('photos');
      expect(options.photos).is.instanceOf(Array);
      expect(options.photos).is.length.above(10);
      done();
   };
   req.params[ph.PHOTO_TAG] = 'horse';
   photo.withTag(req, res);
});

it('loads EXIF', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.EXIF);
      expect(options).toHaveProperty('EXIF');
      expect(options.EXIF).to.contain.all.keys([
         'ISO',
         'artist',
         'lens',
         'model'
      ]);
      expect(options.EXIF).toHaveProperty('sanitized', true);
      done();
   };
   req.params[ph.PHOTO_TAG] = '8458410907';
   photo.exif(req, res);
});
