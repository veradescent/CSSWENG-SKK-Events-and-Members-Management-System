import mongoose from 'mongoose';
import path from 'path';

const mockCreate = jest.fn().mockResolvedValue(true);

// Mock the module using the real path under src so Jest can find it
jest.mock('../src/models/errorLogs', () => ({ create: mockCreate }));

// ./src/models/errorLog.js'

const logError = require('../logError');

describe('logError', () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  test('calls ErrorLog.create with message, stack, route and method', async () => {
    const fakeReq = { originalUrl: '/test-route', method: 'POST' };
    const err = new Error('Unit test error');

    await expect(logError(err, fakeReq)).resolves.toBeUndefined();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Unit test error',
      stack: expect.any(String),
      route: '/test-route',
      method: 'POST'
    }));
  });

  test('does not throw when ErrorLog.create rejects', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB down'));

    const fakeReq = { originalUrl: '/fail-route', method: 'GET' };
    const err = new Error('Another test error');

    // logError should catch internal errors and not reject
    await expect(logError(err, fakeReq)).resolves.toBeUndefined();
    expect(mockCreate).toHaveBeenCalled();
  });
});

test('hello world', () => {
  expect(true).toBe(true);
});
