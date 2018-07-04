import { parse } from 'url';
import { mockFetch } from '@toba/test';

const fetch = mockFetch(url => {
   const link = parse(url.toString(), true);
   return `${__dirname}/${link.query['method']}.json`;
});

export default fetch;
