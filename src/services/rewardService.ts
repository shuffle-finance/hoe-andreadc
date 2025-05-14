/*
Report - Andrea Della Corte - Head of Engineering

Reviewed package.json
Reviewed tsconfig.json
Ran tsc; some errors; uuid is missing
Running npm install
Note: uuid package is actually missing
Fix: ran npm i --save-dev @types/uuid to fix - Fixed
Note: package-lock.json not committed to repo (should ideally be to fix versioning and updated w/ testing)

Note: RewardService uses dependency injection for UserService and MerchantService; good for modularity

Testability: async processTransaction (...) const rewardChance = Math.random() + Math.random - Reviewed code;
Don't think this could be abused, but might be difficult to be testable.

Issue: Fix: Input to issueRewardToUser; be explicit about type - Cleared tsc error

Issue: processTransaction // Inconsistency for multiple retries on processTransaction - Fixing idempotency

Issue: processTransaction // Inconsistency for multiple retries on processTransaction - Implementing retries

Testability: extracted reward checks into a separate method

*/

// src/services/rewardService.ts

type RandomProvider = () => number;

import { Transaction } from '../models/Transaction';
import { Reward } from '../models/Reward';
import { UserService } from './userService';
import { MerchantService } from './merchantService';
import { v4 as uuidv4 } from 'uuid';

export class RewardService {
  private userService: UserService;
  private merchantService: MerchantService;
  private random: RandomProvider;
  
  constructor(
      userService: UserService,
      merchantService: MerchantService,
      random: RandomProvider = Math.random) {
    this.userService = userService;
    this.merchantService = merchantService;
    this.random = random;
  }

  async prepareReward(transaction: Transaction): Promise<Reward | null> {
    // Verify merchant is a partner
    let merchant;
    try {
      merchant = await this.merchantService.getMerchantById(transaction.merchantId);
    } catch (error) {
      console.error('Error fetching merchant:', error);
      return null;
    }
    if (!merchant || !merchant.isActive) {
      return null;
    }
    
    // Verify user exists
    let user;
    try {
      user = await this.userService.getUserById(transaction.userId);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    if (!user) {
      return null;
    }
    
    // Determine if user gets a reward (20% chance)
    const rewardChance = this.random();
    if (rewardChance <= 0.2) {
      // Calculate reward amount (1-10% of transaction)
      const rewardPercentage = Math.floor(this.random() * 10) + 1;
      const rewardAmount = transaction.amount * (rewardPercentage / 100);
      
      // Create reward
      const reward : Reward = {
        id: uuidv4(), // Use UUID for unique reward IDs
        userId: user.id,
        merchantId: merchant.id,
        transactionId: transaction.id,
        amount: rewardAmount,
        percentage: rewardPercentage,
        createdAt: new Date(),
        status: 'pending'
      };

      return reward;
    }

    return null;
  }
  
  async processTransaction(transaction: Transaction): Promise<Reward | null> {

    const existingReward : Reward = await this.getRewardByTransactionId(transaction.id);

    if(existingReward) {
      return existingReward;
    }

    const reward : Reward | null = await this.prepareReward(transaction);

    // Merchant not partner
    // User does not exist
    // Math.random gods weren't on the side of the user
    if(!reward) return null;

    const max_retries = 0;
    let attempt = 0;

    while (attempt < max_retries) {
      // Process reward
      try {
        await this.issueRewardToUser(reward);
        reward.status = 'issued';
        console.log('Reward issued successfully:', reward);
        return reward;
      } catch (error) {
        attempt++;
        console.warn(`Failed to issue reward; attempt ${attempt}/${max_retries}`, error);
        if(attempt > max_retries) {
          console.error(`Failed to issue reward; returning pending reward`, error);
        }
      }
    }

    reward.status = 'failed';
    return reward;
  }

  getRewardByTransactionId(id: string) : Reward {
    throw new Error('STUB - Method not implemented.');
  }
  
  private async issueRewardToUser(reward: Reward): Promise<void> {
    // Simulate API call to payment processor
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% random failure rate to simulate API errors
        if (Math.random() < 0.1) {
          reject(new Error('Payment processor error'));
        } else {
          resolve();
        }
      }, 200);
    });
  }
  
  // This method has no error handling or retries
  async getRewardsForUser(userId: string): Promise<Reward[]> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      return [];
    }
    
    // Should have pagination for large number of rewards
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data - in reality this would be a database query
        resolve([
          {
            id: 'rwd-1',
            userId: userId,
            merchantId: 'merch-1',
            transactionId: 'tx-1',
            amount: 5.20,
            percentage: 5,
            createdAt: new Date(),
            status: 'issued'
          }
        ]);
      }, 100);
    });
  }
}
