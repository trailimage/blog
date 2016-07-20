'use strict';

module.exports = {
   referer: null,
   params: {},
   headers: {},
   connection: { remoteAddress: '' },
   get(field) { return this[field]; },
   header(name) { return this.headers[name];	}
};