import req from './request.mock';

test('allows setting and reading the referer', () => {
   req.referer = 'http://2323423423.copyrightclaims.org';
   expect(req.get('referer')).toBe('http://2323423423.copyrightclaims.org');
});

test('allows setting and reading querystring parameters', () => {
   req.params['key'] = 'value';
   expect(req.params['key']).toBe('value');
});

test('allows setting and reading header values', () => {
   req.headers['key'] = 'value';
   expect(req.header('key')).toBe('value');
});
