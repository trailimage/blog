'use strict';

const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const yard = 3;
const mile = yard * 1760;
const equator = mile * 24901;

module.exports = {
   // distances in terms of feet
   distance: { equator: equator, mile: mile, yard: yard },
   // durations in terms of milliseconds
   time: { second: s, minute: m, hour: h, day: d, week: w },
   month: ['January','February','March','April','May','June','July','August','September','October','November','December'],
   weekday: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
   httpStatus: {
      OK: 200,
      TEMP_REDIRECT: 301,
      PERMANENT_REDIRECT: 302,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_ERROR: 500,
      UNSUPPORTED: 501,
      BAD_GATEWAY: 502,
      UNAVAILABLE: 503
   },
   // http://www.sitepoint.com/web-foundations/mime-types-complete-list/
   mimeType: {
      HTML: 'text/html',
      JSON: 'application/json',
      XML: 'text/xml',
      JSONP: 'application/javascript',
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      TEXT: 'text/plain',
      ZIP: 'application/zip'
   },
   // http://getbootstrap.com/components/
   icon: {
      arrowDown: 'arrow-down',
      arrowLeft: 'arrow-left',
      arrowRight: 'arrow-right',
      arrowUp: 'arrow-up',
      asterisk: 'asterisk',
      banned: 'ban-circle',
      bell: 'bell',
      book: 'book',
      bullhorn: 'bullhorn',
      certificate: 'certificate',
      calendar: 'calendar',
      camera: 'camera',
      chevronLeft: 'chevron-left',
      chevronRight: 'chevron-right',
      cloud: 'cloud',
      cloudDownload: 'cloud-download',
      cog: 'cog',
      compressed: 'compressed',
      download: 'download',
      eye: 'eye-open',
      fire: 'fire',
      flash: 'flash',
      formula: 'baby-formula',
      gift: 'gift',
      globe: 'globe',
      heartOutline: 'heart-empty',
      hourglass: 'hourglass',
      leaf: 'leaf',
      lightning: 'flash',
      link: 'link',
      lock: 'lock',
      login: 'log-in',
      mapMarker: 'map-marker',
      marker: 'map-marker',
      newWindow: 'new-window',
      pencil: 'pencil',
      person: 'user',
      powerButton: 'off',
      refresh: 'refresh',
      remove: 'remove',
      road: 'road',
      save: 'save',
      saveFile: 'save-file',
      tag: 'tag',
      tags: 'tags',
      target: 'screenshot',
      tent: 'tent',
      thumbsUp: 'thumbs-up',
      transfer: 'transfer',
      trash: 'trash',
      upload: 'upload',
      user: 'user',
      x: 'remove',
      zoomIn: 'zoom-in',
      zoomOut: 'zoom-out'
   }
};