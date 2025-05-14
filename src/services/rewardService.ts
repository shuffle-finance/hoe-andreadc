// src/services/rewardService.ts

import { Transaction } from '../models/Transaction';
import { Reward } from '../models/Reward';
import { UserService } from './userService';
import { MerchantService } from './merchantService';
import { v4 as uuidv4 } from 'uuid';

export class RewardService {
  private userService: UserService;
  private merchantService: MerchantService;
  
  constructor(userService: UserService, merchantService: MerchantService) {
    this.userService = userService;
    this.merchantService = merchantService;
  }
  
  async processTransaction(transaction: Transaction): Promise<Reward | null> {
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
    const rewardChance = Math.random();
    if (rewardChance <= 0.2) {
      // Calculate reward amount (1-10% of transaction)
      const rewardPercentage = Math.floor(Math.random() * 10) + 1;
      const rewardAmount = transaction.amount * (rewardPercentage / 100);
      
      // Create reward
      const reward = {
        id: uuidv4(), // Use UUID for unique reward IDs
        userId: user.id,
        merchantId: merchant.id,
        transactionId: transaction.id,
        amount: rewardAmount,
        percentage: rewardPercentage,
        createdAt: new Date(),
        status: 'pending'
      };
      
      // Process reward
      try {
        // This could fail and leave the reward in a pending state with no retry mechanism
        await this.issueRewardToUser(reward);
        reward.status = 'issued';
        console.log('Reward issued successfully:', reward);
        return reward;
      } catch (error) {
        console.error('Failed to issue reward:', error);
        return reward; // Returns the reward with status still "pending"
      }
    }
    
    return null;
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
