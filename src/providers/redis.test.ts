import redis from './redis';

const key = 'test-key';

test('stores a key and value', () => redis.add(key, 'test-value'));
test('removes a key and its value', () => redis.remove(key));

afterAll(done => {
   redis.disconnect();
   done();
});
