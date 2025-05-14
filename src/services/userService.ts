import { User } from '../models/User';

export class UserService {
  async getUserById(userId: string): Promise<User | null> {
    // Mock implementation - in a real app, this would query a database
    if (userId === 'user-doesnt-exist') {
      return null;
    }
    
    return {
      id: userId,
      name: 'Sample User',
      email: 'user@example.com',
      isActive: true
    };
  }
}
