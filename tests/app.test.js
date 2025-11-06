import { jest } from '@jest/globals';
import logError from '../logError.js';

const mockCreate = jest.fn().mockResolvedValue(true);

describe('logError', () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  test('calls ErrorLog.create with message, stack, route and method', async () => {
    const fakeReq = { originalUrl: '/test-route', method: 'POST' };
    const err = new Error('Unit test error');

    await expect(logError(err, fakeReq, { create: mockCreate })).resolves.toBeUndefined();

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
    await expect(logError(err, fakeReq, { create: mockCreate })).resolves.toBeUndefined();
    expect(mockCreate).toHaveBeenCalled();
  });
});

