import { Merchant } from '../models/Merchant';

export class MerchantService {
  async getMerchantById(merchantId: string): Promise<Merchant | null> {
    // Mock implementation - in a real app, this would query a database
    if (merchantId === 'merchant-doesnt-exist') {
      return null;
    }
    
    return {
      id: merchantId,
      name: 'Sample Merchant',
      apiKey: 'sample-api-key',
      isActive: true
    };
  }
  
  async getMerchantByApiKey(apiKey: string): Promise<Merchant | null> {
    // Mock implementation
    if (apiKey === 'invalid-key') {
      return null;
    }
    
    return {
      id: 'merchant-1',
      name: 'Sample Merchant',
      apiKey: apiKey,
      isActive: true
    };
  }
}
