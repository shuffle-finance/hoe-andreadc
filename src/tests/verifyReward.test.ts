// src/tests/verifyReward.test.ts

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../functions/verifyReward';

// Helper to create mock API Gateway events
const createMockEvent = (
  headers: Record<string, string> = {}, 
  queryStringParameters: Record<string, string> | null = null
): APIGatewayProxyEvent => {
  return {
    headers,
    queryStringParameters,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    httpMethod: 'GET',
    path: '',
    isBase64Encoded: false,
    body: null
  };
};

describe('Verify Reward Lambda Function', () => {
  test('Should return 400 when no transaction ID is provided', async () => {
    const event = createMockEvent({
      'x-api-key': 'valid-api-key-123'
    }, null);
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transaction ID is required'
    });
  });

  test('Should return 401 when no API key is provided', async () => {
    const event = createMockEvent({}, { transactionId: '123' });
    const response = await handler(event);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      message: 'API key is required'
    });
  });

  test('Should return 403 when API key is invalid', async () => {
    const event = createMockEvent({
      'x-api-key': 'invalid-api-key'
    }, { transactionId: '123' });
    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid API key' 
    });
  });

  test('Should return 404 when no transaction is found', async () => {
    const event = createMockEvent({
      'x-api-key': 'valid-api-key-123'
    }, { transactionId: 'non-existent-transaction' });
    const response = await handler(event);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transaction not found'
    });
  });

  test('Should return 403 when merchant does not own the transaction', async () => {
    const event = createMockEvent({
      'x-api-key': 'valid-api-key-123'
    }, { transactionId: 'valid-transaction-456' });
    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Transaction does not belong to this merchant'
    });
  });

  test('Should return reward details for valid request', async () => {
    const event = createMockEvent({
      'x-api-key': 'valid-api-key-123'
    }, { transactionId: 'valid-transaction-123' });
    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('reward');
    expect(body.reward).toHaveProperty('id', 'reward123');
    expect(body.reward).toHaveProperty('status', 'issued');
    expect(body.reward).toHaveProperty('createdAt');
    expect(body.reward).toHaveProperty('amount', 5.00);
  });
});
