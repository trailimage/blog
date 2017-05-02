const { logTo } = require('../lib/constants');
const config = require('../lib/config').default;
const mocha = require('mocha');
const { expect } = require('chai');
const log = require('../lib/logger').default;
const mockLogger = require('./mocks/logger.mock');
const logEntry = [];

describe('Logger', ()=> {
   before(()=> {
      log.inject.transport = new mockLogger((level, msg, data) => {
         logEntry.push({ level, msg, data });
      });
   });

   it('supports adding icons to messages', ()=> {
      log.errorIcon('some-icon', 'error message');
      const e = logEntry.pop();
      expect(e.level).equals('error');
      expect(e.msg).equals('error message');
      expect(e.data).to.exist;
      expect(e.data.iconName).equals('some-icon');
   });

   after(()=> {
      log.reset();
   });
});