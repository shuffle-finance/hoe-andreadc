// src/functions/verifyReward.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Mock interfaces - in a real project these would be imported from model files
interface Merchant {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  merchantId: string;
  userId: string;
  amount: number;
  timestamp: Date;
}

interface Reward {
  id: string;
  transactionId: string;
  userId: string;
  merchantId: string;
  amount: number;
  status: 'pending' | 'issued' | 'failed';
  createdAt: Date;
}

// Mock data services - in a real project these would likely be proper DB connectors
const getMerchantByApiKey = async (apiKey: string): Promise<Merchant | null> => {
  // This would be a database lookup in reality
  const merchants: Merchant[] = [
    {
      id: 'merchant1',
      name: 'Example Store',
      apiKey: 'valid-api-key-123',
      isActive: true
    },
    {
      id: 'merchant2',
      name: 'Inactive Store',
      apiKey: 'inactive-key-456',
      isActive: false
    }
  ];
  
  return merchants.find(m => m.apiKey === apiKey) || null;
};

const getTransactionById = async (id: string): Promise<Transaction | null> => {
  // This would be a database lookup in reality
  if (id === 'valid-transaction-123') {
    return {
      id: 'valid-transaction-123',
      merchantId: 'merchant1',
      userId: 'user1',
      amount: 100.00,
      timestamp: new Date()
    };
  }
  if (id === 'valid-transaction-456') {
    return {
      id: 'valid-transaction-456',
      merchantId: 'merchant2',
      userId: 'user1',
      amount: 100.00,
      timestamp: new Date()
    };
  }
  return null;
};

const getRewardByTransactionId = async (transactionId: string): Promise<Reward | null> => {
  // This would be a database lookup in reality
  if (transactionId === 'valid-transaction-123') {
    return {
      id: 'reward123',
      transactionId: 'valid-transaction-123',
      userId: 'user1',
      merchantId: 'merchant1',
      amount: 5.00,
      status: 'issued',
      createdAt: new Date()
    };
  }
  if (transactionId === 'valid-transaction-456') {
    return {
      id: 'reward456',
      transactionId: 'valid-transaction-456',
      userId: 'user1',
      merchantId: 'merchant2',
      amount: 5.00,
      status: 'issued',
      createdAt: new Date()
    };
  }
  return null;
};

const STATUS_CODES: { [key: string]: number } = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Lambda function handler for verifying transaction rewards
 * 
 * This function expects:
 * - An API key in the headers for merchant authentication
 * - A transaction ID in the query parameters
 * 
 * It returns:
 * - Reward information if the transaction has an associated reward
 * - Appropriate error messages for invalid requests or authentication issues
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 1. Extract and validate API key from headers
    const apiKey = event.headers['x-api-key'];

    if (!apiKey) {
      return {
        statusCode: STATUS_CODES.UNAUTHORIZED,
        body: JSON.stringify({ message: 'API key is required' })
      };
    }
    
    // 2. Authenticate the merchant
    const merchant = await getMerchantByApiKey(apiKey);
    if (!merchant) {
      return {
        statusCode: STATUS_CODES.FORBIDDEN,
        body: JSON.stringify({ message: 'Invalid API key' })
      };
    }
    if (!merchant.isActive) {
      return {
        statusCode: STATUS_CODES.FORBIDDEN,
        body: JSON.stringify({ message: 'Merchant account is inactive' })
      };
    }
    
    // 3. Extract and validate the transaction ID
    const transactionId = event.queryStringParameters?.transactionId;
    if (!transactionId) {
      return {
        statusCode: STATUS_CODES.BAD_REQUEST,
        body: JSON.stringify({ message: 'Transaction ID is required' })
      };
    }

    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return {
        statusCode: STATUS_CODES.NOT_FOUND,
        body: JSON.stringify({ message: 'Transaction not found' })
      };
    }
    
    // 4. Verify the transaction belongs to the authenticated merchant
    if (transaction.merchantId !== merchant.id) {
      return {
        statusCode: STATUS_CODES.FORBIDDEN,
        body: JSON.stringify({ message: 'Transaction does not belong to this merchant' })
      };
    }
    
    // 5. Retrieve reward information
    const reward = await getRewardByTransactionId(transactionId);
    if (!reward) {
      return {
        statusCode: STATUS_CODES.NOT_FOUND,
        body: JSON.stringify({ message: 'No reward found for this transaction' })
      };
    }
    
    // 6. Return appropriate response
    return {
      statusCode: STATUS_CODES.SUCCESS,
      body: JSON.stringify({
        message: 'Reward verification successful',
        reward: {
          id: reward.id,
          amount: reward.amount,
          status: reward.status,
          createdAt: reward.createdAt
        }
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
