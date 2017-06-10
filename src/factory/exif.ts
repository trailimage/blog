import { Flickr, EXIF } from '../types/';
import is from '../is';
import re from '../regex';

function make(flickrExif:Flickr.Exif[]):EXIF {
   const parser = (exif:Flickr.Exif[], tag:string, empty:string = null) => {
      for (const key in exif) {
         const e = exif[key];
         if (e.tag == tag) { return e.raw._content; }
      }
      //for (const e of exif) { if (e.tag == tag) { return e.raw._content; } }
      return empty;
   };
   return sanitizeExif({
      artist: parser(flickrExif, 'Artist'),
      compensation: parser(flickrExif, 'ExposureCompensation'),
      time: parser(flickrExif, 'ExposureTime', '0'),
      fNumber: parseFloat(parser(flickrExif, 'FNumber', '0')),
      focalLength: 0,   // calculated in sanitizeExif()
      ISO: parseFloat(parser(flickrExif, 'ISO', '0')),
      lens: parser(flickrExif, 'Lens'),
      model: parser(flickrExif, 'Model'),
      software: parser(flickrExif, 'Software'),
      sanitized: false
   });
}

function sanitizeExif(exif:EXIF):EXIF {
   const numericRange = /\d\-\d/;
   const camera = (text:string) => is.empty(text) ? '' : text
      .replace('NIKON', 'Nikon')
      .replace('ILCE-7R', 'Sony α7ʀ')
      .replace('ILCE-7RM2', 'Sony α7ʀ II')
      .replace('Sony α7ʀM2', 'Sony α7ʀ II')
      .replace('VS980 4G', 'LG G2')
      .replace('XT1060', 'Motorola Moto X')
      .replace('TG-4', 'Olympus Tough TG-3');
   const lens = (text:string, camera:string) => is.empty(text) ? '' : text
      .replace(/FE 35mm.*/i, 'Sony FE 35mm ƒ2.8')
      .replace(/FE 55mm.*/i, 'Sony FE 55mm ƒ1.8')
      .replace(/FE 90mm.*/i, 'Sony FE 90mm ƒ2.8 OSS')
      .replace('58.0 mm f/1.4', 'Voigtländer Nokton 58mm ƒ1.4 SL II')
      .replace('14.0 mm f/2.8', 'Samyang 14mm ƒ2.8')
      .replace('50.0 mm f/1.4', 'Sigma 50mm ƒ1.4 EX DG')
      .replace('35.0 mm f/2.0', (/D700/.test(camera) ? 'Zeiss Distagon T* 2/35 ZF.2' : 'Nikkor 35mm ƒ2.0D'))
      .replace('100.0 mm f/2.0', 'Zeiss Makro-Planar T* 2/100 ZF.2')
      .replace('150.0 mm f/2.8', 'Sigma 150mm ƒ2.8 EX DG HSM APO')
      .replace('90.0 mm f/2.8', 'Tamron 90mm ƒ2.8 SP AF Di')
      .replace('24.0 mm f/3.5', 'Nikkor PC-E 24mm ƒ3.5D ED')
      .replace('14.0-24.0 mm f/2.8', 'Nikon 14–24mm ƒ2.8G ED')
      .replace('24.0-70.0 mm f/2.8', 'Nikon 24–70mm ƒ2.8G ED')
      .replace('17.0-55.0 mm f/2.8', 'Nikon 17–55mm ƒ2.8G')
      .replace('10.0-20.0 mm f/4.0-5.6', 'Sigma 10–20mm ƒ4–5.6 EX DC HSM')
      .replace('1 NIKKOR VR 30-110mm f/3.8-5.6', 'Nikkor 1 30–110mm ƒ3.8–5.6 VR')
      .replace('1 NIKKOR VR 10-30mm f/3.5-5.6', 'Nikkor 1 10–30mm ƒ3.5–5.6 VR')
      .replace('18.0-200.0 mm f/3.5-5.6', 'Nikkor 18–200mm ƒ3.5–5.6G ED VR')
      .replace(/Voigtlander Heliar 15mm.*/i, 'Voigtländer Heliar 15mm ƒ4.5 III');
   const software = (text:string) => is.empty(text) ? '' : text
      .replace('Photoshop Lightroom', 'Lightroom')
      .replace(/\s*\(Windows\)/, '');
   const compensation = (text:string|number) => {
      if (text == '0') { text = 'No'; }
      return text as string;
   };

   if (!exif.sanitized) {
      if (is.value(exif.artist) && re.artist.test(exif.artist)) {
         // only sanitize EXIF for photos shot by known artists
         exif.model = camera(exif.model);
         exif.lens = lens(exif.lens, exif.model);
         exif.compensation = compensation(exif.compensation);
         exif.ISO = parseInt(exif.ISO.toString());
         // don't show focal length for primes
         if (!numericRange.test(exif.lens)) { exif.focalLength = null; }
      }
      exif.software = software(exif.software);
      exif.sanitized = true;
   }
   return exif;
}

export default { make };