import pdf from './pdfkit.mock';

test('records font registrations', () => {
   pdf.registerFont('testFont', 'font/path/name.ttf');
   expect(pdf.fonts['testFont']).toBe('font/path/name.ttf');
});
