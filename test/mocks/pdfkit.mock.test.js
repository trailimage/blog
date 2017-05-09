const mocha = require('mocha');
const expect = require('chai').expect;
const pdf = require('./pdfkit.mock');

describe('Mock PDF Document', ()=> {
   it('records font registrations', ()=> {
      pdf.registerFont('testFont', 'font/path/name.ttf');
      expect(pdf.fonts['testFont']).equals('font/path/name.ttf');
   });
});