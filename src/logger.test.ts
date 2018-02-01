import log from './logger';
const mockLogger = require('./mocks/logger.mock');
const logEntry: any[] = [];

beforeAll(() => {
   log.inject.transport = new mockLogger((level, msg, data) => {
      logEntry.push({ level, msg, data });
   });
});

it('supports adding icons to messages', () => {
   log.errorIcon('some-icon', 'error message');
   const e = logEntry.pop();
   expect(e.level).toBe('error');
   expect(e.msg).toBe('error message');
   expect(e.data).toBeDefined();
   expect(e.data.iconName).toBe('some-icon');
});

afterAll(() => {
   log.reset();
});
