import kml from './kml';

//const mock = require('../mocks/');

it.skip('extracts KML from KMZ', () =>
   mock
      .loadFile('motorcycle.kmz')
      .then(kml.fromKMZ)
      .then(doc => {
         expect(doc).toBeDefined();
      })); //.timeout(10000);

test('parses HTML property descriptions', () => {
   const properties = {
      name: 'Test Name',
      description: sample
   };
   const updated = kml.parseDescription(properties);

   expect(updated).toBeDefined();
   expect(updated).toHaveProperty('DEPOSIT', 'Tanner Manganese Prospect');
   expect(updated).toHaveProperty('DMSLAT', 443312);
});

const sample = `<![CDATA[<html xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:msxsl="urn:schemas-microsoft-com:xslt">

<head>

<META http-equiv="Content-Type" content="text/html">

<meta http-equiv="content-type" content="text/html; charset=UTF-8">

</head>

<body style="margin:0px 0px 0px 0px;overflow:auto;background:#FFFFFF;">

<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-collapse:collapse;padding:3px 3px 3px 3px">

<tr style="text-align:center;font-weight:bold;background:#9CBCE2">

<td>CLARK</td>

</tr>

<tr>

<td>

<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px">

<tr>

<td>SequenceNumber</td>

<td>AS0015</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>DEPOSIT</td>

<td>Tanner Manganese Prospect</td>

</tr>

<tr>

<td>Latitude</td>

<td>44.55333</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>Longitude</td>

<td>-111.70528</td>

</tr>

<tr>

<td>Location_type</td>

<td>3</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>DMSLAT</td>

<td>443312</td>

</tr>

<tr>

<td>DMSLONG</td>

<td>1114219</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>24kquad</td>

<td>UPPER RED ROCK LAKE</td>

</tr>

<tr>

<td>100kQuad</td>

<td>HEBGEN LAKE

</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>CountyName</td>

<td>CLARK</td>

</tr>

<tr>

<td>LandOwner</td>

<td>U.S. Forest Service</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>FSAgencyName</td>

<td>Targhee NF</td>

</tr>

<tr>

<td>lon_WGS84</td>

<td>-111.705976</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>lat_WGS84</td>

<td>44.553189</td>

</tr>

<tr>

<td>TOWNSHIP</td>

<td>014N</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>RANGE</td>

<td>040E</td>

</tr>

<tr>

<td>SECTION</td>

<td>11</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>QSECTION</td>

<td>SE</td>

</tr>

<tr>

<td>ZIP_CODE</td>

<td>83446</td>

</tr>

<tr bgcolor="#D4E4F3">

<td>Mining_District</td>

<td></td>

</tr>

<tr>

<td>Hard_File</td>

<td>YES</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>

]]>`;
