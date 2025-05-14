export interface Reward {
  id: string;
  userId: string;
  merchantId: string;
  transactionId: string;
  amount: number;
  percentage: number;
  createdAt: Date;
  status: 'pending' | 'issued' | 'failed';
}
