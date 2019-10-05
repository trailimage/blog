import { re } from './regex';
import { lipsum } from '@toba/test';

const nl = '\r\n';
const text = `some
text on more
than

one line`;

it('matches quote characters', () => {
   expect('"say"“'.replace(re.quote.any, '')).toBe('say');
});

it('matches quote block', () => {
   let quote = '“' + lipsum + nl + '“' + lipsum + '”' + nl;
   expect(re.quote.block.test(quote)).toBe(true);

   // but not if quote block is interrupted
   quote = '“' + lipsum + ',” he said, “' + lipsum + nl;
   expect(re.quote.block.test(quote)).toBe(false);
});

it('matches line breaks', () => {
   expect(text.replace(re.lineBreak, '-')).toBe(
      'some-text on more-than--one line'
   );
});

it('identifies numbers', () => {
   expect(re.numeric.test('1.3')).toBe(true);
   expect(re.numeric.test((-26.36).toString())).toBe(true);
   expect(re.numeric.test('.1.3')).toBe(false);
   expect(re.numeric.test('1.3654654654')).toBe(true);
   expect(re.numeric.test('1555553')).toBe(true);
});
