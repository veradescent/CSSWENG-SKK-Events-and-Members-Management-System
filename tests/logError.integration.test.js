import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ErrorLog from '../src/models/errorLogs.js';
import logError from '../logError.js';

let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: 'test' });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
beforeEach(async () => {
  await ErrorLog.deleteMany({});
});

test('logError writes to ErrorLog collection', async () => {
  const fakeReq = { originalUrl: '/test', method: 'GET' };
  const err = new Error('Integration test error');
  await logError(err, fakeReq, ErrorLog); // <-- pass ErrorLog as third argument
  const doc = await ErrorLog.findOne({ message: 'Integration test error' });
  expect(doc).toBeTruthy();
  expect(doc.route).toBe('/test');
  expect(doc.method).toBe('GET');
});
