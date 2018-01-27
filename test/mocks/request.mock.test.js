const mocha = require('mocha');
const expect = require('chai').expect;
const req = require('./request.mock');

describe('Mock Request', () => {
   it('allows setting and reading the referer', () => {
      req.referer = 'http://2323423423.copyrightclaims.org';
      expect(req.get('referer')).equals(
         'http://2323423423.copyrightclaims.org'
      );
   });

   it('allows setting and reading querystring parameters', () => {
      req.params['key'] = 'value';
      expect(req.params['key']).equals('value');
   });

   it('allows setting and reading header values', () => {
      req.headers['key'] = 'value';
      expect(req.header('key')).equals('value');
   });
});
