const mocha = require('mocha');
const expect = require('chai').expect;
const config = require('../lib/config').default;
const util = require('../lib/util').default;
const { lipsum } = require('./mocks/');
let u;   // undefined

describe('Utilities', ()=> {
   describe('Date and Time', ()=> {
      it('display date as MMM d, YYYY', ()=> {
         // month value is zero-based
         expect(util.date.toString(new Date(1973, 2, 15))).equals('March 15, 1973');
      });

      it('shows AM or PM for hour of day', ()=> {
         expect(util.date.hourOfDay(2)).equals('AM 2');
         expect(util.date.hourOfDay(14)).equals('PM 2');
      });

      it('shows hours:minutes for fractional hour', ()=> {
         expect(util.date.hoursAndMinutes(5.5)).equals('5:30');
      });

      it('detects if Daylight Savings Time is active', ()=> {
         expect(util.date.inDaylightSavings(new Date(2010, 1, 1))).is.false;
         // Can't detect true case when test runs in locale that doesn't have DST
         //expect(util.date.inDaylightSavings(new Date(2010, 8, 1))).is.true;
      });

      it('converts date strings to Dates', ()=> {
         const d1 = util.date.parse('2010-12-5 8:48:14');
         const hourOffset1 = util.date.timeZoneOffset(d1);

         expect(d1.getUTCFullYear()).equals(2010);
         expect(d1.getUTCHours()).equals(8 - hourOffset1);
         expect(d1.getUTCDate()).equals(5);
         expect(d1.getUTCMonth()).equals(11); // 0-based

         // daylight savings time
         const d2 = util.date.parse('1998-8-31 11:48:14');
         const hourOffset2 = util.date.timeZoneOffset(d2);
         expect(d2.getUTCFullYear()).equals(1998);
         expect(d2.getUTCHours()).equals(11 - hourOffset2);
         expect(d2.getUTCDate()).equals(31);
         expect(d2.getUTCMonth()).equals(7); // 0-based
      });

      it('converts timestamp to Date', ()=> {
         // Jan 9, 2013 12:35:56
         const target = new Date(Date.UTC(2013, 1, 9, 12, 35, 56));
         const offset = util.date.timeZoneOffset(target);
         const source = util.date.fromTimeStamp('1360438556');
         // date constructor automatically converts to local timezone so manually adjust
         target.setHours(target.getHours() - offset);

         expect(source).to.eql(target);
      });

      it.skip('formats timestamp according to ISO 8601', ()=> {

      });
   });

   describe('HTML', ()=> {
      it('formats fractions', ()=> {
         expect(util.html.fraction('1/2')).equals('<sup>1</sup>&frasl;<sub>2</sub>');
      });

      it('creates HTML for a photo tag list', ()=> {
         expect(util.html.photoTagList(['Second', 'First', 'Third and Last'])).equals(
            '<a href="/photo-tag/first" rel="tag">First</a> <a href="/photo-tag/second" rel="tag">Second</a> <a href="/photo-tag/thirdandlast" rel="tag">Third and Last</a> ');
      });

      it('substitutes nicer typography', ()=> {
         expect(util.typography(u)).is.empty;
         expect(util.typography('')).is.empty;
         expect(util.typography('"He said," she said')).equals('&ldquo;He said,&rdquo; she said');
         expect(util.typography('<a href="/page">so you "say"</a>')).equals('<a href="/page">so you &ldquo;say&rdquo;</a>');
      });

      it('fixes malformed links and URL decode text', ()=> {
         let source = '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf';
         let target = '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20(4-2011%20Issue%202).pdf">www.motoidaho.com/sites/default/files/IAMC Newsletter (4-2011 Issue 2).pdf</a>';

         expect(util.html.fixMalformedLink(source)).equals(target);

         source = '<a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf';
         target = '<a href="http://www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf">www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf</a>';

         expect(util.html.fixMalformedLink(source)).equals(target);

         source = '<a href="http://idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2" rel="nofollow">idahohistory.cdmhost.com/cdm/singleitem/collection/p16281...</a>';
         target = '<a href="http://idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2">idahohistory.cdmhost.com/cdm/singleitem/collection/p16281coll21/id/116/rec/2</a>';

         expect(util.html.fixMalformedLink(source)).equals(target);

         source = '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228" rel="nofollow">www.plosone.org/article/info:doi/10.1371/journal.pone.003...</a>';
         target = '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">www.plosone.org/article/info:doi/10.1371/journal.pone.0032228</a>';

         expect(util.html.fixMalformedLink(source)).equals(target);

         source = '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3" rel="nofollow">www.facebook.com/media/set/?set=a.592596880759703.1073741...</a>';
         target = '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3</a>';

         expect(util.html.fixMalformedLink(source)).equals(target);
      });

      it('shortens link text to domain and URL decoded page', ()=> {
         let source = '<a href="http://www.site.com/some/link-thing/that/goes/to%20page">http://www.site.com/some/link-thing/that/goes/to%20page</a>';
         let target = '<a href="http://www.site.com/some/link-thing/that/goes/to%20page">site.com/&hellip;/to page</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="http://www.site.com/some/link-thing/that/goes/on">regular link text</a>';

         expect(util.html.shortenLinkText(source)).equals(source);

         source = '<a href="http://www.advrider.com/forums/showthread.php?t=185698" rel="nofollow">www.advrider.com/forums/showthread.php?t=185698</a>';
         target = '<a href="http://www.advrider.com/forums/showthread.php?t=185698">advrider.com/&hellip;/showthread</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="http://www.tvbch.com/TVBCH_newsletter_2013-08.doc" rel="nofollow">www.tvbch.com/TVBCH_newsletter_2013-08.doc</a>';
         target = '<a href="http://www.tvbch.com/TVBCH_newsletter_2013-08.doc">tvbch.com/TVBCH_newsletter_2013-08</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="http://youtu.be/QzdSlYoZitU" rel="nofollow">youtu.be/QzdSlYoZitU</a>';
         target = '<a href="http://youtu.be/QzdSlYoZitU">youtu.be/QzdSlYoZitU</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">www.plosone.org/article/info:doi/10.1371/journal.pone.0032228</a>';
         target = '<a href="http://www.plosone.org/article/info:doi/10.1371/journal.pone.0032228">plosone.org/&hellip;/journal.pone.0032228</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3</a>';
         target = '<a href="https://www.facebook.com/media/set/?set=a.592596880759703.1073741842.243333819019346&type=3">facebook.com/&hellip;/set</a>';

         expect(util.html.shortenLinkText(source)).equals(target);

         source = '<a href="http://www.trailimage.com/first-ride-to-silver-city/#8" rel="nofollow">www.trailimage.com/first-ride-to-silver-city/#8</a>';
         target = '<a href="http://www.trailimage.com/first-ride-to-silver-city/#8">trailimage.com/first-ride-to-silver-city</a>';

         expect(util.html.shortenLinkText(source)).equals(target);
      });

   });

   describe('Numbers', ()=> {
      it('adds leading zeros to reach total digit length', ()=> {
         expect(util.number.pad(2, 0)).equals('2');
         expect(util.number.pad(2, 1)).equals('2');
         expect(util.number.pad(2, 2)).equals('02');
         expect(util.number.pad(99, 2)).equals('99');
      });

      it('converts number to words for number', ()=> {
         expect(util.number.say(3)).equals('Three');
         expect(util.number.say(4, false)).equals('four');
         expect(util.number.say(-14)).equals('-14');
         expect(util.number.say(20)).equals('Twenty');
         expect(util.number.say(21)).equals('21');
      });

      it('extracts numbers from strings', ()=> {
         expect(util.number.parse('hey 34')).equals(34);
         expect(util.number.parse('wow 28.9')).equals(28.9);
         expect(util.number.parse('nothing')).to.be.NaN;
      });
   });

   describe('Encoding', ()=> {
      // http://rot13.com/
      it('ROT-13 encodes text', ()=> {
         expect(util.encode.rot13('Neque porro quisquam est qui dolorem ipsum')).equals('Ardhr cbeeb dhvfdhnz rfg dhv qbyberz vcfhz');
      });

      // https://www.base64encode.org/
      it('base 64 encodes text', ()=> {
         expect(util.encode.toBase64('Neque porro quisquam est qui dolorem ipsum')).equals('TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt');
      });
      it('base 64 decodes text', ()=> {
         expect(util.encode.fromBase64('TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt')).equals('Neque porro quisquam est qui dolorem ipsum');
      });

      it.skip('obfuscates characters as HTML entities', ()=> {

      });
   });

   describe('Icons', ()=> {
      it('creates material icon tags', ()=> {
         expect(util.icon.tag('star')).equals('<i class="material-icons star">star</i>');
      });

      it('matches post categories to material icons', ()=> {
         config.style.icon.category = { Test: 'success', default: 'whatever' };

         expect(util.icon.category('Test')).equals('<i class="material-icons success">success</i>');
         // revert to default if provided
         expect(util.icon.category('Nothing')).equals('<i class="material-icons whatever">whatever</i>');

         // blank if no default
         delete config.style.icon.category['default'];
         expect(util.icon.category('Nothing')).is.empty;

         // blank if no icons defined
         delete config.style.icon.category;
         expect(util.icon.category('Nothing')).is.empty;
      });
   });

   it('truncates IPv6 to v4', ()=> {
      expect(util.IPv6('::1')).equals('127.0.0.1');
      expect(util.IPv6('192.12.15.3')).equals('192.12.15.3');
      expect(util.IPv6('::abf2:192.12.15.3')).equals('192.12.15.3');
   });

   it('extracts top domain from URL', ()=> {
      expect(util.topDomain('http://www.microsoft.com')).equals('microsoft.com');
      expect(util.topDomain('https://github.com/bjoshuanoah/express-spam-referral-blocker')).equals('github.com');
      expect(util.topDomain('342342342.copyrightclaims.org')).equals('copyrightclaims.org');
   });

   it('formats log messages', ()=> {
      const field = 'message';
      const log = { message: null };

      expect(util.logMessage(log, field)).equals('[no message]');

      log.message = '/autumn-ride-to-boise/gpx not found for 10.180.57.199';

      let output = '<a href="/autumn-ride-to-boise/gpx" target="_blank">/autumn-ride-to-boise/gpx</a>'
         + ' not found for <a href="' + config.log.ipLookupUrl + '10.180.57.199" target="_blank">10.180.57.199</a>';

      expect(util.logMessage(log, field)).equals(output);

      log.message  = '/8330346003 not found for 10.230.214.144';
      output = '/<a href="' + config.log.photoUrl + '8330346003" target="_blank">8330346003</a>'
            + ' not found for <a href="' + config.log.ipLookupUrl + '10.230.214.144" target="_blank">10.230.214.144</a>';

      expect(util.logMessage(log, field)).equals(output);
   });


   it('adds .remove() method to strings', ()=> {
      expect('string').to.have.property('remove');
      expect(('some text').remove('text')).equals('some ');
   });

   it('substitutes placeholders for values', ()=> {
      expect(util.format('nothing')).equals('nothing');
      expect(util.format('{0} {1}', 'one', 'two')).equals('one two');
      expect(util.format('{1} {0}', 'one', 'two')).equals('two one');
   });

   it('capitalizes first word', ()=> {
      expect(util.capitalize('one two')).equals('One two');
   });

   it('converts phrase to URL slug', ()=> {
      expect(util.slug('Wiggle and Roll')).equals('wiggle-and-roll');
      expect(util.slug('Wiggle and    Sing')).equals('wiggle-and-sing');
      expect(util.slug('Too---dashing')).equals('too-dashing');
      expect(util.slug('powerful/oz')).equals('powerful-oz');
   });

   describe('Photo Captions', ()=> {
      const nl = '\r\n';
      // double-space
      const ds = nl + nl;

      it('identifies quote at end of text', ()=> {
         const source = lipsum + ds + '“' + lipsum + '”';
         const target = '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p></blockquote>';

         expect(util.html.caption(source)).equals(target);
      });

      it('identifies paragraphs within a quote', ()=> {
         const source = lipsum + ds + '“' + lipsum + ds + '“' + lipsum + ds + '“' + lipsum + '”';
         const target = '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p><p>' + lipsum + '</p><p>' + lipsum + '</p></blockquote>';

         expect(util.html.caption(source)).equals(target);
      });

      it('identifies quote within text', ()=> {
         // text before and after quote
         const source = lipsum + ds + '“' + lipsum + '”' + ds + lipsum;
         const target = '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p></blockquote><p class="first">' + lipsum + '</p>';

         expect(util.html.caption(source)).equals(target);
      });

      it('identifies inline poems', ()=> {
         // no text after
         let source = lipsum + ds + 'Have you ever stood on the top of a mountain' + nl
            + 'And gazed down on the grandeur below' + nl
            + 'And thought of the vast army of people' + nl
            + '· · Who never get out as we go?' + ds
            + 'Have you ever trailed into the desert' + nl
            + 'Where the hills fade from gold into blue,' + nl
            + 'And then thought of some poor other fellow' + nl
            + 'Who would like to stand alongside of you?';
         let target = '<p>' + lipsum + '</p><blockquote class="poem"><p>'
            + 'Have you ever stood on the top of a mountain<br/>'
            + 'And gazed down on the grandeur below<br/>'
            + 'And thought of the vast army of people<br/>'
            + '<span class="tab"></span>Who never get out as we go?</p><p>'
            + 'Have you ever trailed into the desert<br/>'
            + 'Where the hills fade from gold into blue,<br/>'
            + 'And then thought of some poor other fellow<br/>'
            + 'Who would like to stand alongside of you?</p></blockquote>';

         expect(util.html.caption(source)).equals(target);

         // text after poem
         source = lipsum + ds + 'Have you ever stood on the top of a mountain' + nl
            + 'And gazed down on the grandeur below' + nl
            + 'And thought of the vast army of people.' + ds
            + lipsum;
         target = '<p>' + lipsum + '</p><blockquote class="poem"><p>'
            + 'Have you ever stood on the top of a mountain<br/>'
            + 'And gazed down on the grandeur below<br/>'
            + 'And thought of the vast army of people.</p></blockquote>'
            + '<p class="first">' + lipsum + '</p>';

         expect(util.html.caption(source)).equals(target);
      });

      it('identifies haiku', ()=> {
         let source = 'neck bent' + nl + 'apply the brakes' + nl + 'for the reign of fire';
         let target = '<p class="haiku">neck bent<br/>apply the brakes<br/>for the reign of fire<i class="material-icons spa">spa</i></p>';

         expect(util.html.story(source)).equals(target);

         source = 'cows stand chewing' + nl + 'wet meadow grass' + nl + 'while mud swallows wheels' + ds
            + 'Here we have Joel "Runs with Cows" Abbott. He did a little loop out among them—kind of became one of them.';
         target = '<p class="haiku">cows stand chewing<br/>wet meadow grass<br/>while mud swallows wheels<i class="material-icons spa">spa</i></p>'
            + '<p>Here we have Joel &ldquo;Runs with Cows&rdquo; Abbott. He did a little loop out among them—kind of became one of them.</p>';

         expect(util.html.story(source)).equals(target);
      });

      it('identifies captions that are entirely a poem', ()=> {
         const source = '-' + nl
            + 'Begotten Not Born' + nl
            + 'Indwelling Transcendence' + nl
            + '· · · · Infinite Regress' + nl
            + 'Uncertain Progress' + nl
            + '-';
         const target = '<p class="poem">'
            + 'Begotten Not Born<br/>'
            + 'Indwelling Transcendence<br/>'
            + '<span class="tab"></span><span class="tab"></span>Infinite Regress<br/>'
            + 'Uncertain Progress</p>';

         expect(util.html.story(source)).equals(target);
      });

      it('styles superscripts', ()=> {
         const source = lipsum + '²';
         const target = '<p>' + lipsum + '<sup>²</sup></p>';
         expect(util.html.caption(source)).equals(target);
      });

      it('identifies footnotes', ()=> {
         let source = lipsum + nl
            + '___' + nl
            + '* Note about photo credit' + nl
            + '¹ Some other note' + nl
            + '² Last note';
         let target = '<p>' + lipsum + '</p><ol class="footnotes" start="0">'
            + '<li class="credit"><i class="material-icons star">star</i><span>Note about photo credit</span></li>'
            + '<li><span>Some other note</span></li>'
            + '<li><span>Last note</span></li></ol>';

         expect(util.html.caption(source)).equals(target);

         source = lipsum + nl
            + '___' + nl
            + '¹ Some other note' + nl
            + '² Last note';
         target = '<p>' + lipsum + '</p><ol class="footnotes">'
            + '<li><span>Some other note</span></li>'
            + '<li><span>Last note</span></li></ol>';

         expect(util.html.caption(source)).equals(target);

         // should ignore trailing newline
         source += nl;

         expect(util.html.caption(source)).equals(target);
      });

      it.skip('styles quips');
   });
});