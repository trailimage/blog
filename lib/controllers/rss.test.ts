import '@toba/test';
import { Header, MimeType } from '@toba/tools';
import { postFeed } from './rss';
import { MockRequest, MockResponse } from '@toba/test';
import { loadMockData } from './.test-data';

const req = new MockRequest();
const res = new MockResponse(req);

beforeAll(async done => {
   await loadMockData();
   done();
});

test('generates valid Atom XML', done => {
   res.onEnd = () => {
      expect(res.headers).toHaveKeyValue(Header.Content.Type, MimeType.XML);
      expect(res.content).toMatchSnapshot();
      done();
   };
   postFeed(req, res);
});
