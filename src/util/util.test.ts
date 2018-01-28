import util from './index';
import { lipsum } from '@toba/test';

const nl = '\r\n';
// double-space
const ds = nl + nl;
const u: string = undefined;

test('display date as MMM d, YYYY', () => {
   // month value is zero-based
   expect(util.date.toString(new Date(1973, 2, 15))).toBe('March 15, 1973');
});

test('shows AM or PM for hour of day', () => {
   expect(util.date.hourOfDay(2)).toBe('AM 2');
   expect(util.date.hourOfDay(14)).toBe('PM 2');
});

test('shows hours:minutes for fractional hour', () => {
   expect(util.date.hoursAndMinutes(5.5)).toBe('5:30');
});

test('converts timestamp to Date', () => {
   // Jan 9, 2013 12:35:56
   const target = new Date(Date.UTC(2013, 1, 9, 12, 35, 56));
   const offset = util.date.timeZoneOffset(target);
   const source = util.date.fromTimeStamp('1360438556');
   // date constructor automatically converts to local timezone so manually adjust
   target.setHours(target.getHours() - offset);

   expect(source).to.eql(target);
});

//it.skip('formats timestamp according to ISO 8601', () => {});

test('formats fractions', () => {
   expect(util.html.fraction('1/2')).toBe('<sup>1</sup>&frasl;<sub>2</sub>');
});

test('creates HTML for a photo tag list', () => {
   expect(util.html.photoTagList(['Second', 'First', 'Third and Last'])).equals(
      '<a href="/photo-tag/first" rel="tag">First</a> <a href="/photo-tag/second" rel="tag">Second</a> <a href="/photo-tag/thirdandlast" rel="tag">Third and Last</a> '
   );
});

test('substitutes nicer typography', () => {
   expect(util.html.typography(u)).not.toBeDefined();
   expect(util.html.typography('')).not.toBeDefined();
   expect(util.html.typography('"He said," she said')).toBe(
      '&ldquo;He said,&rdquo; she said'
   );
   expect(util.html.typography('<a href="/page">so you "say"</a>')).equals(
      '<a href="/page">so you &ldquo;say&rdquo;</a>'
   );
});

test('fixes malformed links and URL decode text', () => {
   let source =
      '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf';
   let target =
      '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20(4-2011%20Issue%202).pdf">www.motoidaho.com/sites/default/files/IAMC Newsletter (4-2011 Issue 2).pdf</a>';

   expect(util.html.fixMalformedLink(source)).toBe(target);

   source =
      '<a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf';
   target =
      '<a href="http://www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf">www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf</a>';

   expect(util.html.fixMalformedLink(source)).toBe(target);

   source =
      '<a href="http://idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2" rel="nofollow">idahohistory.cdmhost.com/cdm/singleitem/collection/p16281...</a>';
   target =
      '<a href="http://idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2">idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2</a>';

   expect(util.html.fixMalformedLink(source)).toBe(target);

   source =
      '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228" rel="nofollow">www.plosone.org/article/info:doi/10.1371/journal.pone.003...</a>';
   target =
      '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">www.plosone.org/article/info:doi/10.1371/journal.pone.0032228</a>';

   expect(util.html.fixMalformedLink(source)).toBe(target);

   source =
      '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3" rel="nofollow">www.facebook.com/media/set/?set=a.592596880759703.1073741...</a>';
   target =
      '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3</a>';

   expect(util.html.fixMalformedLink(source)).toBe(target);
});

test('shortens link text to domain and URL decoded page', () => {
   let source =
      '<a href="http://www.site.com/some/link-thing/that/goes/to%20page">http://www.site.com/some/link-thing/that/goes/to%20page</a>';
   let target =
      '<a href="http://www.site.com/some/link-thing/that/goes/to%20page">site.com/&hellip;/to page</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="http://www.site.com/some/link-thing/that/goes/on">regular link text</a>';

   expect(util.html.shortenLinkText(source)).toBe(source);

   source =
      '<a href="http://www.advrider.com/forums/showthread.php?t=185698" rel="nofollow">www.advrider.com/forums/showthread.php?t=185698</a>';
   target =
      '<a href="http://www.advrider.com/forums/showthread.php?t=185698">advrider.com/&hellip;/showthread</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="http://www.tvbch.com/TVBCH_newsletter_2013-08.doc" rel="nofollow">www.tvbch.com/TVBCH_newsletter_2013-08.doc</a>';
   target =
      '<a href="http://www.tvbch.com/TVBCH_newsletter_2013-08.doc">tvbch.com/TVBCH_newsletter_2013-08</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="http://youtu.be/QzdSlYoZitU" rel="nofollow">youtu.be/QzdSlYoZitU</a>';
   target = '<a href="http://youtu.be/QzdSlYoZitU">youtu.be/QzdSlYoZitU</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">www.plosone.org/article/info:doi/10.1371/journal.pone.0032228</a>';
   target =
      '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">plosone.org/&hellip;/journal.pone.0032228</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3</a>';
   target =
      '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">facebook.com/&hellip;/set</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);

   source =
      '<a href="http://www.trailimage.com/first-ride-to-silver-city/#8" rel="nofollow">www.trailimage.com/first-ride-to-silver-city/#8</a>';
   target =
      '<a href="http://www.trailimage.com/first-ride-to-silver-city/#8">trailimage.com/first-ride-to-silver-city</a>';

   expect(util.html.shortenLinkText(source)).toBe(target);
});

// https://www.base64encode.org/
test('base 64 encodes text', () => {
   expect(
      util.encode.toBase64('Neque porro quisquam est qui dolorem ipsum')
   ).toBe('TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt');
});
test('base 64 decodes text', () => {
   expect(
      util.encode.fromBase64(
         'TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt'
      )
   ).toBe('Neque porro quisquam est qui dolorem ipsum');
});

//it.skip('obfuscates characters as HTML entities', () => false);

test('creates material icon tags', () => {
   expect(util.icon.tag('star')).toBe(
      '<i class="material-icons star">star</i>'
   );
});

test('matches post categories to material icons', () => {
   config.style.icon.category = { Test: 'success', default: 'whatever' };

   expect(util.icon.category('Test')).toBe(
      '<i class="material-icons success">success</i>'
   );
   // revert to default if provided
   expect(util.icon.category('Nothing')).toBe(
      '<i class="material-icons whatever">whatever</i>'
   );

   // blank if no default
   delete config.style.icon.category['default'];
   expect(util.icon.category('Nothing')).not.toBeDefined();

   // blank if no icons defined
   delete config.style.icon.category;
   expect(util.icon.category('Nothing')).not.toBeDefined();
});

test('truncates IPv6 to v4', () => {
   expect(util.IPv6('::1')).toBe('127.0.0.1');
   expect(util.IPv6('192.12.15.3')).toBe('192.12.15.3');
   expect(util.IPv6('::abf2:192.12.15.3')).toBe('192.12.15.3');
});

test('extracts top domain from URL', () => {
   expect(util.topDomain('http://www.microsoft.com')).toBe('microsoft.com');
   expect(
      util.topDomain(
         'https://github.com/bjoshuanoah/express-spam-referral-blocker'
      )
   ).toBe('github.com');
   expect(util.topDomain('342342342.copyrightclaims.org')).toBe(
      'copyrightclaims.org'
   );
});

test('formats log messages', () => {
   const field = 'message';
   const log: { [key: string]: string } = { message: null };

   expect(util.logMessage(log, field)).toBe('[no message]');

   log.message = '/autumn-ride-to-boise/gpx not found for 10.180.57.199';

   let output =
      '<a href="/autumn-ride-to-boise/gpx" target="_blank">/autumn-ride-to-boise/gpx</a>' +
      ' not found for <a href="' +
      config.log.ipLookupUrl +
      '10.180.57.199" target="_blank">10.180.57.199</a>';

   expect(util.logMessage(log, field)).toBe(output);

   log.message = '/8330346003 not found for 10.230.214.144';
   output =
      '/<a href="' +
      config.log.photoUrl +
      '8330346003" target="_blank">8330346003</a>' +
      ' not found for <a href="' +
      config.log.ipLookupUrl +
      '10.230.214.144" target="_blank">10.230.214.144</a>';

   expect(util.logMessage(log, field)).toBe(output);
});

test('identifies quote at end of text', () => {
   const source = lipsum + ds + '“' + lipsum + '”';
   const target =
      '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p></blockquote>';

   expect(util.html.caption(source)).toBe(target);
});

test('identifies paragraphs within a quote', () => {
   const source =
      lipsum + ds + '“' + lipsum + ds + '“' + lipsum + ds + '“' + lipsum + '”';
   const target =
      '<p>' +
      lipsum +
      '</p><blockquote><p>' +
      lipsum +
      '</p><p>' +
      lipsum +
      '</p><p>' +
      lipsum +
      '</p></blockquote>';

   expect(util.html.caption(source)).toBe(target);
});

test('identifies quote within text', () => {
   // text before and after quote
   const source = lipsum + ds + '“' + lipsum + '”' + ds + lipsum;
   const target =
      '<p>' +
      lipsum +
      '</p><blockquote><p>' +
      lipsum +
      '</p></blockquote><p class="first">' +
      lipsum +
      '</p>';

   expect(util.html.caption(source)).toBe(target);
});

test('does not blockquote interrupted quotes', () => {
   // do no blockquote when quote is interrupted
   // “The constitutions of nearly all the states have qualifications for voters simply on citizenship,” Pefley countered, “without question with regard to what they believe on this or that question. Then I ask, why make a distinction of the people of Idaho?
   // “It appears to have been reserved for Idaho’s constitution to put in the first religious test in regard to the right of suffrage and holding office … Political and religious persecution are supposed to have died at the termination of the revolution but it appears that Idaho is again an exception.”¹
   // Pefley’s arguments were unheeded and the section was approved.

   const source =
      '“' + lipsum + ',” he said, “' + lipsum + ds + '“' + lipsum + '”' + ds;
   const target =
      '<p>“' +
      lipsum +
      ',” he said, “' +
      lipsum +
      '</p><blockquote><p>' +
      lipsum +
      '</p></blockquote>';

   expect(util.html.caption(source)).toBe(target);
});

test('identifies inline poems', () => {
   // no text after
   let source =
      lipsum +
      ds +
      'Have you ever stood on the top of a mountain' +
      nl +
      'And gazed down on the grandeur below' +
      nl +
      'And thought of the vast army of people' +
      nl +
      '· · Who never get out as we go?' +
      ds +
      'Have you ever trailed into the desert' +
      nl +
      'Where the hills fade from gold into blue,' +
      nl +
      'And then thought of some poor other fellow' +
      nl +
      'Who would like to stand alongside of you?';
   let target =
      '<p>' +
      lipsum +
      '</p><blockquote class="poem"><p>' +
      'Have you ever stood on the top of a mountain<br/>' +
      'And gazed down on the grandeur below<br/>' +
      'And thought of the vast army of people<br/>' +
      '<span class="tab"></span>Who never get out as we go?</p><p>' +
      'Have you ever trailed into the desert<br/>' +
      'Where the hills fade from gold into blue,<br/>' +
      'And then thought of some poor other fellow<br/>' +
      'Who would like to stand alongside of you?</p></blockquote>';

   expect(util.html.caption(source)).toBe(target);

   // text after poem
   source =
      lipsum +
      ds +
      'Have you ever stood on the top of a mountain' +
      nl +
      'And gazed down on the grandeur below' +
      nl +
      'And thought of the vast army of people.' +
      ds +
      lipsum;
   target =
      '<p>' +
      lipsum +
      '</p><blockquote class="poem"><p>' +
      'Have you ever stood on the top of a mountain<br/>' +
      'And gazed down on the grandeur below<br/>' +
      'And thought of the vast army of people.</p></blockquote>' +
      '<p class="first">' +
      lipsum +
      '</p>';

   expect(util.html.caption(source)).toBe(target);
});

test('identifies haiku', () => {
   let source =
      'neck bent' + nl + 'apply the brakes' + nl + 'for the reign of fire';
   let target =
      '<p class="haiku">neck bent<br/>apply the brakes<br/>for the reign of fire<i class="material-icons spa">spa</i></p>';

   expect(util.html.story(source)).toBe(target);

   source =
      'cows stand chewing' +
      nl +
      'wet meadow grass' +
      nl +
      'while mud swallows wheels' +
      ds +
      'Here we have Joel "Runs with Cows" Abbott. He did a little loop out among them—kind of became one of them.';
   target =
      '<p class="haiku">cows stand chewing<br/>wet meadow grass<br/>while mud swallows wheels<i class="material-icons spa">spa</i></p>' +
      '<p>Here we have Joel &ldquo;Runs with Cows&rdquo; Abbott. He did a little loop out among them—kind of became one of them.</p>';

   expect(util.html.story(source)).toBe(target);
});

test('identifies captions that are entirely a poem', () => {
   const source =
      '-' +
      nl +
      'Begotten Not Born' +
      nl +
      'Indwelling Transcendence' +
      nl +
      '· · · · Infinite Regress' +
      nl +
      'Uncertain Progress' +
      nl +
      '-';
   const target =
      '<p class="poem">' +
      'Begotten Not Born<br/>' +
      'Indwelling Transcendence<br/>' +
      '<span class="tab"></span><span class="tab"></span>Infinite Regress<br/>' +
      'Uncertain Progress</p>';

   expect(util.html.story(source)).toBe(target);
});

test('styles superscripts', () => {
   const source = lipsum + '²';
   const target = '<p>' + lipsum + '<sup>²</sup></p>';
   expect(util.html.caption(source)).toBe(target);
});

test('identifies footnotes', () => {
   let source =
      lipsum +
      nl +
      '___' +
      nl +
      '* Note about photo credit' +
      nl +
      '¹ Some other note' +
      nl +
      '² Last note';
   let target =
      '<p>' +
      lipsum +
      '</p><ol class="footnotes" start="0">' +
      '<li class="credit"><i class="material-icons star">star</i><span>Note about photo credit</span></li>' +
      '<li><span>Some other note</span></li>' +
      '<li><span>Last note</span></li></ol>';

   expect(util.html.caption(source)).toBe(target);

   source = lipsum + nl + '___' + nl + '¹ Some other note' + nl + '² Last note';
   target =
      '<p>' +
      lipsum +
      '</p><ol class="footnotes">' +
      '<li><span>Some other note</span></li>' +
      '<li><span>Last note</span></li></ol>';

   expect(util.html.caption(source)).toBe(target);

   // should ignore trailing newline
   source += nl;

   expect(util.html.caption(source)).toBe(target);
});

//it.skip('styles quips');
