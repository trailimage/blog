const mocha = require('mocha');
const expect = require('chai').expect;
const re = require('../lib/regex').default;
const text = `some
text on more
than

one line`;

describe('Patterns', ()=> {
   it('matches quote characters', ()=> {
      expect('"say"“'.replace(re.quote.any, '')).equals('say');
   });

   it('matches line breaks', ()=> {
      expect(text.replace(re.lineBreak, '-')).equals('some-text on more-than--one line');
   });
});